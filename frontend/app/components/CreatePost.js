import React, { useEffect, useState, useContext } from 'react';
import Page from './Page';
import Axios from 'axios';
import { withRouter } from 'react-router-dom';
import DispatchContext from '../DispatchContext';
import StateContext from '../StateContext';

function CreatePost(props) {
  const [title, setTitle] = useState();
  const [body, setBody] = useState();
  const appDispatch = useContext(DispatchContext);
  const appState = useContext(StateContext);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await Axios.post('/create-post', {
        title,
        body,
        token: appState.user.token,
      });
      console.log(response);
      //Redirect to new post url
      if (response.data[0].includes('offensive')) {
        appDispatch({
          type: 'flashMessage',
          value: 'Your post contains offensive words, it has been deleted.',
        });
        props.history.push('/create-post');
      } else if (response.data[0].includes('empty')) {
        appDispatch({
          type: 'flashMessage',
          value: 'Title and body can not be empty.',
        });
        props.history.push('/create-post');
      } else {
        appDispatch({
          type: 'flashMessage',
          value: 'Congrats, you successfuly created a post.',
        });
        props.history.push(`/post/${response.data}`);
        console.log('new post was successfullly created');
      }
    } catch (err) {
      console.log('==============');
      console.log(err);
    }
  }

  return (
    <Page title='Create New Post'>
      <form onSubmit={handleSubmit}>
        <div className='form-group'>
          <label htmlFor='post-title' className='text-muted mb-1'>
            <small>Title</small>
          </label>
          <input
            onChange={e => setTitle(e.target.value)}
            autoFocus
            name='title'
            id='post-title'
            className='form-control form-control-lg form-control-title'
            type='text'
            placeholder=''
            autoComplete='off'
          />
        </div>

        <div className='form-group'>
          <label htmlFor='post-body' className='text-muted mb-1 d-block'>
            <small>Body Content</small>
          </label>
          <textarea
            onChange={e => setBody(e.target.value)}
            name='body'
            id='post-body'
            className='body-content tall-textarea form-control'
            type='text'
          ></textarea>
        </div>

        <button className='btn btn-primary'>Save New Post</button>
      </form>
    </Page>
  );
}

export default withRouter(CreatePost);
