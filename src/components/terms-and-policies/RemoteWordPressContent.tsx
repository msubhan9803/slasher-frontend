/* eslint-disable max-lines */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import LoadingIndicator from '../ui/LoadingIndicator';

interface Props {
  className?: string;
  url: string,
  fallbackContent: JSX.Element;
}

function RemoteWordPressContent({ className, url, fallbackContent }: Props) {
  const [content, setContent] = useState<string>();
  const [showFallbackContent, setShowFallbackContent] = useState<boolean>(false);
  useEffect(() => {
    axios.get(url)
      .then((response) => {
        const remoteContent = response.data?.[0]?.content?.rendered;
        if (remoteContent) {
          setContent(remoteContent);
        } else {
          setShowFallbackContent(true);
        }
      })
      .catch(() => { setShowFallbackContent(true); });
  }, [url]);

  const renderContent = () => {
    if (showFallbackContent) { return fallbackContent; }
    if (!content) { return <LoadingIndicator />; }
    // eslint-disable-next-line react/no-danger
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  };

  return (
    <div className={className}>
      {renderContent()}
    </div>
  );
}

RemoteWordPressContent.defaultProps = {
  className: '',
};

export default RemoteWordPressContent;
