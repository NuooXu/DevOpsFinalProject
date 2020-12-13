import React, { useEffect, useState, useContext } from 'react';
import { useImmerReducer } from 'use-immer';
import Page from './Page';
import { useParams, Link, withRouter } from 'react-router-dom';
import Axios from 'axios';
import LoadingDotsIcon from './LoadingDotsIcon';
import StateContext from '../StateContext';
import DispatchContext from '../DispatchContext';
import NotFound from './NotFound';

function EditPost(props) {
  const appState = useContext(StateContext);
  const appDispatch = useContext(DispatchContext);

  const originalState = {
    title: {
      value: '',
      hasErrors: false,
      message: '',
    },
    body: {
      value: '',
      hasErrors: false,
      message: '',
    },
    isFetching: true,
    isSaving: false,
    id: useParams().id,
    sendCount: 0,
    notFound: false,
  };

  function ourReducer(draft, action) {
    switch (action.type) {
      case 'fetchComplete':
        draft.title.value = action.value.title;
        draft.body.value = action.value.body;
        draft.isFetching = false;
        return;
      case 'titleChange':
        draft.title.hasErrors = false;
        draft.title.value = action.value;
        return;
      case 'bodyChange':
        draft.body.hasErrors = false;
        draft.body.value = action.value;
        return;
      case 'submitRequest':
        if (!draft.title.hasErrors && !draft.body.hasErrors) {
          draft.sendCount++;
        }
        return;
      case 'savaRequestStarted':
        draft.isSaving = true;
        return;
      case 'savaRequestFinished':
        draft.isSaving = false;
        return;
      case 'titleRules':
        if (!action.value.trim()) {
          draft.title.hasErrors = true;
          draft.title.message = 'You must provide a title.';
        }
        return;
      case 'bodyRules':
        if (!action.value.trim()) {
          draft.body.hasErrors = true;
          draft.body.message = 'You must provide a body content.';
        }
        return;
      case 'notFound':
        draft.notFound = true;
        return;
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, originalState);

  function submitHandler(e) {
    e.preventDefault();
    dispatch({ type: 'titleRules', value: state.title.value });
    dispatch({ type: 'bodyRules', value: state.body.value });
    dispatch({ type: 'submitRequest' });
  }

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source();

    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${state.id}`, {
          cancelToken: ourRequest.token,
        });
        if (response.data) {
          dispatch({ type: 'fetchComplete', value: response.data });
          if (appState.user.username != response.data.author.username) {
            appDispatch({
              type: 'flashMessage',
              value: 'You do not have permission to edit that post.',
            });
            //redirect to homepage
            props.history.push('/');
          }
        } else {
          dispatch({ type: 'notFound' });
        }
      } catch (e) {
        console.log('These was wrong');
      }
    }
    fetchPost();
    return () => {
      ourRequest.cancel();
    };
  }, []);

  useEffect(() => {
    if (state.sendCount) {
      dispatch({ type: 'saveRequestStarted' });
      const ourRequest = Axios.CancelToken.source();

      async function fetchPost() {
        try {
          const response = await Axios.post(
            `/post/${state.id}/edit`,
            {
              title: state.title.value,
              body: state.body.value,
              token: appState.user.token,
            },
            { cancelToken: ourRequest.token }
          );
          dispatch({ type: 'savaRequestFinished' });
          appDispatch({ type: 'flashMessage', value: 'Post was updated!' });
        } catch (e) {
          console.log('These was wrong');
        }
      }
      fetchPost();
      return () => {
        ourRequest.cancel();
      };
    }
  }, [state.sendCount]);

  if (state.notFound) {
    return <NotFound />;
  }

  if (state.isFetching)
    return (
      <Page title='...'>
        <LoadingDotsIcon />
      </Page>
    );

  return (
    <Page title='Edit Post'>
      <Link className='small font-weight-bold' to={`/post/${state.id}`}>
        &laquo; Back to post permalink
      </Link>
      <form className='mt-3' onSubmit={submitHandler}>
        <div className='form-group'>
          <label htmlFor='post-title' className='text-muted mb-1'>
            <small>Title</small>
          </label>
          <input
            onBlur={e =>
              dispatch({ type: 'titleRules', value: e.target.value })
            }
            onChange={e =>
              dispatch({ type: 'titleChange', value: e.target.value })
            }
            value={state.title.value}
            autoFocus
            name='title'
            id='post-title'
            className='form-control form-control-lg form-control-title'
            type='text'
            placeholder=''
            autoComplete='off'
          />
          {state.title.hasErrors && (
            <div className='alert alert-danger small liveValidateMessage'>
              {state.title.message}
            </div>
          )}
        </div>

        <div className='form-group'>
          <label htmlFor='post-body' className='text-muted mb-1 d-block'>
            <small>Body Content</small>
          </label>
          <textarea
            onBlur={e => dispatch({ type: 'bodyRules', value: e.target.value })}
            onChange={e =>
              dispatch({ type: 'bodyChange', value: e.target.value })
            }
            name='body'
            id='post-body'
            className='body-content tall-textarea form-control'
            type='text'
            value={state.body.value}
          />
          {state.body.hasErrors && (
            <div className='alert alert-danger small liveValidateMessage'>
              {state.body.message}
            </div>
          )}
        </div>

        <button className='btn btn-primary' disabled={state.isSaving}>
          Save Updates
        </button>
      </form>
    </Page>
  );
}

export default withRouter(EditPost);
