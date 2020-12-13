const postsCollection = require('../db').db().collection('posts');
const followsCollection = require('../db').db().collection('follows');
const ObjectID = require('mongodb').ObjectID;
const User = require('./User');
const sanitizeHTML = require('sanitize-html');
var Filter = require('bad-words');
var redis = require('redis');
const { listen } = require('../app');
const dns = require('dns');

let todayTweet = [];
let client = null;
dns.lookup('redis', (err, address, family) => {
  if (err) {
    console.log('cannot get redis ip!');
  } else {
    console.log('Redis IP is：' + address + 'IP family is: ' + family);
    client = redis.createClient('6379', address);
  }
});

let Post = function (data, userid, requestedPostId) {
  this.data = data;
  this.errors = [];
  this.userid = userid;
  this.requestedPostId = requestedPostId;
};

Post.prototype.cleanUp = function () {
  if (typeof this.data.title != 'string') {
    this.data.title = '';
  }
  if (typeof this.data.body != 'string') {
    this.data.body = '';
  }

  // get rid of any bogus properties
  this.data = {
    title: sanitizeHTML(this.data.title.trim(), {
      allowedTags: [],
      allowedAttributes: {},
    }),
    body: sanitizeHTML(this.data.body.trim(), {
      allowedTags: [],
      allowedAttributes: {},
    }),
    createdDate: new Date(),
    author: ObjectID(this.userid),
  };
};

Post.prototype.validate = function () {
  if (this.data.title == '') {
    this.errors.push('You must provide a title, title cannot be empty.');
  }
  if (this.data.body == '') {
    this.errors.push('You must provide post content, body cannot be empty.');
  }
};

Post.prototype.create = function () {
  return new Promise((resolve, reject) => {
    this.cleanUp();
    this.validate();
    if (!this.errors.length) {
      //filer bad words
      filter = new Filter();
      this.data.title = filter.clean(this.data.title);
      this.data.body = filter.clean(this.data.body);
      todayTweet.push({ id: this.userid, data: this.data });
      if (!this.data.title.includes('*') && !this.data.body.includes('*')) {
        //redis store data
        try {
          if (client) {
            this.data.author = this.data.author.toString();
            client.set(Math.random() * 1000, JSON.stringify(this.data));
          }
        } catch (err) {
          console.log(err);
        }
      } else {
        this.errors.push(
          'Your post contains offensive words, it has been deleted.'
        );
        reject(this.errors);
      }

      const timer = () => {
        client.keys('*', function (err, keys) {
          keys.forEach(k => {
            client.get(k, (err, value) => {
              const dataDB = JSON.parse(value);
              dataDB.author = dataDB.author.trim();
              dataDB.author = ObjectID(dataDB.author);

              // real save post into mongoDB
              postsCollection
                .insertOne(dataDB)
                .then(info => {
                  resolve(info.ops[0]._id);
                })
                .catch(e => {
                  this.errors.push('Please try again later.');
                  reject(this.errors);
                });
              client.del(k);
            });
          });
        });
      };
      setInterval(() => {
        timer();
      }, 1000 * 10);
    } else {
      reject(this.errors);
    }
  });
};

Post.prototype.update = function () {
  return new Promise(async (resolve, reject) => {
    try {
      let post = await Post.findSingleById(this.requestedPostId, this.userid);
      if (post.isVisitorOwner) {
        // actually update the db
        let status = await this.actuallyUpdate();
        resolve(status);
      } else {
        reject();
      }
    } catch (e) {
      reject();
    }
  });
};

Post.prototype.actuallyUpdate = function () {
  return new Promise(async (resolve, reject) => {
    this.cleanUp();
    this.validate();
    if (!this.errors.length) {
      await postsCollection.findOneAndUpdate(
        { _id: new ObjectID(this.requestedPostId) },
        { $set: { title: this.data.title, body: this.data.body } }
      );
      resolve('success');
    } else {
      resolve('failure');
    }
  });
};

Post.reusablePostQuery = function (uniqueOperations, visitorId) {
  return new Promise(async function (resolve, reject) {
    let aggOperations = uniqueOperations.concat([
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'authorDocument',
        },
      },
      {
        $project: {
          title: 1,
          body: 1,
          createdDate: 1,
          authorId: '$author',
          author: { $arrayElemAt: ['$authorDocument', 0] },
        },
      },
    ]);

    let posts = await postsCollection.aggregate(aggOperations).toArray();

    // clean up author property in each post object
    posts = posts.map(function (post) {
      post.isVisitorOwner = post.authorId.equals(visitorId);
      post.authorId = undefined;

      post.author = {
        username: post.author.username,
        avatar: new User(post.author, true).avatar,
      };

      return post;
    });

    resolve(posts);
  });
};

Post.findSingleById = function (id, visitorId) {
  return new Promise(async function (resolve, reject) {
    if (typeof id != 'string' || !ObjectID.isValid(id)) {
      reject();
      return;
    }

    let posts = await Post.reusablePostQuery(
      [{ $match: { _id: new ObjectID(id) } }],
      visitorId
    );

    if (posts.length) {
      resolve(posts[0]);
    } else {
      reject();
    }
  });
};

Post.findByAuthorId = function (authorId) {
  return Post.reusablePostQuery([
    { $match: { author: authorId } },
    { $sort: { createdDate: -1 } },
  ]);
};

Post.findByAuthorId_today = function (authorId) {
  todayTweet.forEach(tweet => {
    if (tweet.id === id) return tweet.data;
  });
};

Post.delete = function (postIdToDelete, currentUserId) {
  return new Promise(async (resolve, reject) => {
    try {
      let post = await Post.findSingleById(postIdToDelete, currentUserId);
      if (post.isVisitorOwner) {
        await postsCollection.deleteOne({ _id: new ObjectID(postIdToDelete) });
        resolve();
      } else {
        reject();
      }
    } catch (e) {
      reject();
    }
  });
};

Post.search = function (searchTerm) {
  return new Promise(async (resolve, reject) => {
    if (typeof searchTerm == 'string') {
      let posts = await Post.reusablePostQuery([
        { $match: { $text: { $search: searchTerm } } },
        { $sort: { score: { $meta: 'textScore' } } },
      ]);
      resolve(posts);
    } else {
      reject();
    }
  });
};

Post.countPostsByAuthor = function (id) {
  return new Promise(async (resolve, reject) => {
    let postCount = await postsCollection.countDocuments({ author: id });
    resolve(postCount);
  });
};

Post.getFeed = async function (id) {
  // create an array of the user ids that the current user follows
  let followedUsers = await followsCollection
    .find({ authorId: new ObjectID(id) })
    .toArray();
  followedUsers = followedUsers.map(function (followDoc) {
    return followDoc.followedId;
  });

  // look for posts where the author is in the above array of followed users
  return Post.reusablePostQuery([
    { $match: { author: { $in: followedUsers } } },
    { $sort: { createdDate: -1 } },
  ]);
};

module.exports = Post;
