import React, { useState, useContext } from 'react';
// import './Sidebar.css';
import TwitterIcon from '@material-ui/icons/Twitter';
import SidebarOption from './SidebarOption';
import HomeIcon from '@material-ui/icons/Home';
import SearchIcon from '@material-ui/icons/Search';
import NotificationsNoneIcon from '@material-ui/icons/NotificationsNone';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import BookmarkBorderIcon from '@material-ui/icons/BookmarkBorder';
import ListAltIcon from '@material-ui/icons/ListAlt';
import PermIdentityIcon from '@material-ui/icons/PermIdentity';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import { Button } from '@material-ui/core';
import HeaderLoggedOut from './HeaderLoggedOut';
import HeaderLoggedIn from './HeaderLoggedIn';
import StateContext from '../StateContext';
import { Link } from 'react-router-dom';
import DispatchContext from '../DispatchContext';
import ReactTooltip from 'react-tooltip';

function Sidebar(props) {
  const appDispatch = useContext(DispatchContext);
  const appState = useContext(StateContext);
  const headerContent = appState.loggedIn ? (
    <HeaderLoggedIn />
  ) : (
    <HeaderLoggedOut />
  );

  function handleLoggout() {
    appDispatch({ type: 'logout' });
    appDispatch({
      type: 'flashMessage',
      value: 'You have successfully logged out.',
    });
  }

  function handlerSearchIcon(e) {
    e.preventDefault();
    appDispatch({ type: 'openSearch' });
  }
  return (
    <div className='sidebar'>
      <TwitterIcon className='sidebar__twitterIcon' />
      <SidebarOption active Icon={HomeIcon} text='Home' />
      <SidebarOption
        Icon={SearchIcon}
        text='Explore'
        clickEvent={handlerSearchIcon}
      />
      <SidebarOption Icon={NotificationsNoneIcon} text='Notifications' />
      <SidebarOption
        Icon={MailOutlineIcon}
        text='Messages'
        clickEvent={() => appDispatch({ type: 'toggleChat' })}
      />
      <SidebarOption Icon={BookmarkBorderIcon} text='Bookmarks' />
      <SidebarOption Icon={ListAltIcon} text='Lists' />
      <SidebarOption
        Icon={PermIdentityIcon}
        text='Profile'
        appState={appState}
      />
      <SidebarOption Icon={MoreHorizIcon} text='More' />
      {/* Button -> Tweet */}
      <ReactTooltip
        place='bottom'
        id='profile'
        className='custom-tooltip'
      />{' '}
      <Button variant='outlined' className='sidebar__tweet' fullWidth>
        <Link to='/create-post'>Tweet</Link>
      </Button>
      <Button
        variant='outlined'
        className='sidebar__tweet'
        onClick={handleLoggout}
        fullWidth
      >
        Sign Out
      </Button>
    </div>
  );
}

export default Sidebar;
