import React, { useState, useReducer, useEffect, Suspense } from 'react';
import ReactDOM from 'react-dom';
import { useImmerReducer } from 'use-immer';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import Axios from 'axios';
Axios.defaults.baseURL =
  'http://a19189527b342477ead75aa685d1c68c-1836042969.us-east-2.elb.amazonaws.com';

import { setWebSocketURL } from '../app/components/Chat';
import StateContext from './StateContext';
import DispatchContext from './DispatchContext';

//my components
import Header from './components/Header';
import HomeGuest from './components/HomeGuest';
import Footer from './components/Footer';
import About from './components/About';
import Terms from './components/Terms';
import Home from './components/Home';
const CreatePost = React.lazy(() => import('./components/CreatePost'));
const ViewSinglePost = React.lazy(() => import('./components/ViewSinglePost'));
import FlashMessages from './components/FlashMessages';
import Profile from './components/Profile';
import EditPost from './components/EditPost';
import NotFound from './components/NotFound';
const Search = React.lazy(() => import('./components/Search'));
const Chat = React.lazy(() => import('./components/Chat'));
import LoadingDotsIcon from './components/LoadingDotsIcon';
import Sidebar from './components/Sidebar';
// const qs = (function (a) {
//   if (a === '') return {};
//   let b = {};
//   for (let i = 0; i < a.length; ++i) {
//     let p = a[i].split('=', 2);

//     if (p.length === 1) b[p[0]] = '';
//     else b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, ' '));
//     console.log(b[p[0]]);
//   }
//   return b;
// })(window.location.search.substr(1).split('&'));
// Axios.defaults.baseURL = qs['webapp'];
// setWebSocketURL(qs['webapp']);
function Main() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem('complexappToken')),
    flashMessages: [],
    user: {
      token: localStorage.getItem('complexappToken'),
      username: localStorage.getItem('complexappUsername'),
      avatar: localStorage.getItem('complexappAvatar'),
    },
    isSearchOpen: false,
    isChatOpen: false,
    unreadChatCount: 0,
  };
  // setWebSocketURL(
  //   'a19189527b342477ead75aa685d1c68c-1836042969.us-east-2.elb.amazonaws.com'
  // );

  function ourReducer(draft, action) {
    switch (action.type) {
      case 'login':
        draft.loggedIn = true;
        draft.user = action.data;
        return;
      case 'logout':
        draft.loggedIn = false;
        return;
      case 'flashMessage':
        draft.flashMessages.push(action.value);
        return;
      case 'openSearch':
        draft.isSearchOpen = true;
        return;
      case 'closeSearch':
        draft.isSearchOpen = false;
        return;
      case 'toggleChat':
        draft.isChatOpen = !draft.isChatOpen;
        return;
      case 'closeChat':
        draft.isChatOpen = false;
        return;
      case 'incrementUnreadChatCount':
        draft.unreadChatCount++;
        return;
      case 'clearUnreadChatCount':
        draft.unreadChatCount = 0;
        return;
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem('complexappToken', state.user.token);
      localStorage.setItem('complexappUsername', state.user.username);
      localStorage.setItem('complexappPassword', state.user.avatar);
    } else {
      localStorage.removeItem('complexappToken');
      localStorage.removeItem('complexappUsername');
      localStorage.removeItem('complexappPassword');
    }
  }, [state.loggedIn]);

  // const [loggedIn, setLoggedIn] = useState(Boolean(localStorage.getItem("complexappToken")))
  // const [flashMessages, setFlashMessages] = useState([])

  // function addFlashMessage(msg) {
  //   setFlashMessages(prev => prev.concat(msg))
  // }

  //check if token has expired or not on first render
  useEffect(() => {
    if (state.loggedIn) {
      //send axios request here
      const ourRequest = Axios.CancelToken.source();
      async function fetchResults() {
        try {
          const response = await Axios.post(
            '/checkToken',
            { token: state.user.token },
            { cancelToken: ourRequest.token }
          );
          if (!response.data) {
            dispatch({ type: 'logout' });
            dispatch({
              type: 'flashMessage',
              value: 'Your session has expired. Please log in again.',
            });
          }
        } catch (e) {
          console.log('There was a problem or the request was cancelled.');
        }
      }
      fetchResults();
      return () => ourRequest.cancel();
    }
  }, []);

  const style = state.loggedIn ? { display: 'flex' } : { display: 'block' };
  return (
    <div style={style}>
      <StateContext.Provider value={state}>
        <DispatchContext.Provider value={dispatch}>
          <BrowserRouter>
            <FlashMessages messages={state.flashMessages} />
            {state.loggedIn ? <Sidebar /> : <Header />}
            <Suspense fallback={<LoadingDotsIcon />}>
              {/* <div className='feed'>
              <div className='feed__header'> */}
              <Switch>
                <Route path='/profile/:username'>
                  <Profile />
                </Route>
                <Route path='/' exact>
                  {state.loggedIn ? <Home /> : <HomeGuest />}
                </Route>
                <Route path='/post/:id' exact>
                  <ViewSinglePost />
                </Route>
                <Route path='/post/:id/edit' exact>
                  <EditPost />
                </Route>
                <Route path='/create-post'>
                  <CreatePost />
                </Route>
                <Route path='/about-us'>
                  <About />
                </Route>
                <Route path='/terms'>
                  <Terms />
                </Route>
                <Route>
                  <NotFound />
                </Route>
              </Switch>
              {/* </div>
            </div> */}
            </Suspense>
            <CSSTransition
              timeout={330}
              in={state.isSearchOpen}
              classNames='search-overlay'
              unmountOnExit
            >
              <div className='search-overlay'>
                <Suspense fallback=''>
                  <Search />
                </Suspense>
              </div>
            </CSSTransition>
            <Suspense fallback=''>{state.loggedIn && <Chat />}</Suspense>
            {/* <Footer /> */}
          </BrowserRouter>
        </DispatchContext.Provider>
      </StateContext.Provider>
    </div>
  );
}

ReactDOM.render(<Main />, document.querySelector('#app'));

if (module.hot) {
  module.hot.accept();
}
