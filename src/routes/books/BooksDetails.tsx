import React, { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import AuthenticatedPageWrapper from '../../components/layout/main-site-wrapper/authenticated/AuthenticatedPageWrapper';
import RoundButton from '../../components/ui/RoundButton';
import AboutBooks from './components/AboutBooks';
import CreatePostInput from './components/CreatePostInput';
import postImage from '../../images/book-post-image.jpg';
import PostFeed from '../../components/ui/PostFeed/PostFeed';
import BooksOverview from './BooksOverview';

const postData = [
  {
    id: 1,
    userName: 'Aly khan',
    profileImage: 'https://i.pravatar.cc/300?img=12',
    postDate: '06/18/2022 11:10 PM',
    content: 'A retired cop battles a murderer who never gets his hands dirty when he kills. And a man stumbles into a league of immortal assassins, who kill to protect their.',
    postUrl: postImage,
    likeIcon: false,
  },
];
const popoverOptions = ['Edit', 'Delete'];
function BooksDetails() {
  const navigate = useNavigate();
  const path = useParams();
  const [selectedTab, setSelectedTab] = useState<string>();
  const changeTab = (value: string) => {
    if (value === 'posts') { navigate(`/books/1/${value}`); }
    if (value === 'details') { navigate(`/books/1/${value}`); }
    setSelectedTab(value);
  };
  useEffect(() => {
    if (path && path.id) {
      setSelectedTab(path.id);
    } else {
      setSelectedTab('details');
    }
  }, [path]);
  return (
    <AuthenticatedPageWrapper rightSidebarType="book">
      <Container fluid className="mb-5">
        <RoundButton className="d-lg-none w-100 my-3 fs-4">Add your book</RoundButton>
        <AboutBooks setSelectedTab={changeTab} selectedTab={selectedTab} />
        {selectedTab === 'posts' && (
          <>
            <CreatePostInput />
            <PostFeed postFeedData={postData} popoverOptions={popoverOptions} />
          </>
        )}
        {
          selectedTab === 'details' && (
            <BooksOverview />
          )
        }
      </Container>
    </AuthenticatedPageWrapper>
  );
}

export default BooksDetails;
