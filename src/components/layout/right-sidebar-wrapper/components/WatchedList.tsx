import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { DateTime } from 'luxon';
import ExperienceListItem from './ExperienceListItem';
import SidebarHeaderWithLink from './SidebarHeaderWithLink';
import { User } from '../../../../types';
import { getUserMoviesList } from '../../../../api/users';
import LoadingIndicator from '../../../ui/LoadingIndicator';

type WatchedListProps = { user: User };

interface WatchedMovieList {
  _id: string,
  releaseDate: string,
  rating: number,
  worthWatching: number,
  name: string,
  logo: string
}

function WatchedList({ user }: WatchedListProps) {
  const [watchListItems, setWatchListItems] = useState<WatchedMovieList[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user._id) { return; }

    getUserMoviesList('watched-list', '', user._id, 'name', '')
      .then((result: any) => {
        setWatchListItems(result.data.slice(0, 3));
        setLoading(false);
      });
  }, [user]);
  if (!user._id) { return null; }

  return (
    <div>
      <SidebarHeaderWithLink headerLabel="Watched list" headerLabelCount={user.watchedListMovieCount} linkLabel="See All" linkTo={`/${user && user.userName}/watched-list`} />
      <div className="p-3 bg-dark rounded-3">
        <Row>
          {!loading && watchListItems.length === 0 && <div>No movies yet.</div>}
          {loading ? <LoadingIndicator />
            : watchListItems.map((watchListItem) => (
              <Col xs="4" key={watchListItem.name}>
                <ExperienceListItem
                  image={watchListItem.logo}
                  title={watchListItem.name}
                  year={+DateTime.fromISO(watchListItem.releaseDate).toFormat('yyyy')}
                  numericRating={watchListItem.rating}
                  thumbRating={watchListItem.worthWatching}
                  id={watchListItem._id}
                />
              </Col>
            ))}
        </Row>
      </div>
    </div>
  );
}

export default WatchedList;
