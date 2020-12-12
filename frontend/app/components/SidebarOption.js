import React from 'react';
import { Link } from 'react-router-dom';
// import "./SidebarOption.css";

function SidebarOption({ active, text, Icon, clickEvent, appState }) {
  const renderSidebar = () => {
    if (text === 'Home') return <Link to='/'>{text}</Link>;
    if (text === 'Explore')
      return (
        <Link to='#' onClick={clickEvent}>
          {text}
        </Link>
      );
    if (text === 'Profile')
      return <Link to={`/profile/${appState.user.username}`}>{text}</Link>;
    if (text === 'Lists') return <Link to='#'>{text}</Link>;
    if (text === 'Bookmarks') return <Link to='#'>{text}</Link>;
    if (text === 'Messages')
      return (
        <Link to='#' onClick={clickEvent}>
          {text}
        </Link>
      );
    if (text === 'Notifications') return <Link to='#'>{text}</Link>;
    if (text === 'More') return <Link to='#'>{text}</Link>;
  };
  return (
    <div className={`sidebarOption ${active && 'sidebarOption--active'}`}>
      <Icon />
      {/*  */}
      <h2>
        {/* <Link to='/'>{text}</Link> */}
        {renderSidebar()}
      </h2>
    </div>
  );
}

export default SidebarOption;
