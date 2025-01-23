// src/components/ShareActions/DetailShareActions.js
import React, { useState } from 'react';
import FaceBook from "../../assets/fb.png";
import Instagram from "../../assets/instagram.png";
import Twitter from "../../assets/twitter.png";
import styles from './DetailShareActions.module.css';

const DetailShareActions = ({ id }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const socialMediaIcons = [
    { name: 'Facebook', icon: FaceBook },
    { name: 'Instagram', icon: Instagram },
    { name: 'Twitter', icon: Twitter },
  ];

  const handleShare = () => {
    window.FB.ui({
      method: 'share',
      href: `https://example.com/events/${id}`,
    }, function (response) { });
  };

  const handleSocialMediaClick = (socialMediaName) => {
    console.log(`Clicked on ${socialMediaName}`);
  };

  return (
    <div className={styles.container}>
      <button className={styles.shareButton} onClick={handleClick}>
        Share
      </button>
      {isOpen && (
        <div className={styles.popover}>
          <div className={styles.socialMediaList}>
            {socialMediaIcons.map((socialMedia, index) => (
              <div
                key={index}
                className={styles.socialMediaItem}
                onClick={() => handleSocialMediaClick(socialMedia.name)}
              >
                <img
                  src={socialMedia.icon}
                  onClick={handleShare}
                  className={styles.socialMediaIcon}
                  alt={socialMedia.name}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailShareActions;