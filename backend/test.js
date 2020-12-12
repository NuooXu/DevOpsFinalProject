//offensive words filter
const Filter = require('bad-words'),
  filter = new Filter();
// filter.addWords('bullshit', 'shit');
console.log(filter.clean('prostitute'));

//redis
// const redis = require('redis');

// const client = redis.createClient();

// client.hset('final', 'hello');
// client.hget('final', '0');
// client.hgetall('final', () => {});
