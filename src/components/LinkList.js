import React from 'react';
import Link from './Link';
import { Query } from 'react-apollo';
import { gql } from 'apollo-boost';

const LinkList = () => {
  const FEED_QUERY = gql`
    {
      feed {
        links {
          id
          url
          description
        }
      }
    }
  `

  return (
    <div>
      <Query query={FEED_QUERY}>
        {({ loading, error, data}) => {
          if (loading) return <div>Fetching</div>
          if (error) return <div>Error</div>

          const linksToRender = data.feed.links

          return (
            <div>
              {linksToRender.map(link => {
                return (
                  <Link key={link.id} link={link} />
                )
              })}
            </div>
          )
        }}
      </Query>
    </div>
  );
}
 
export default LinkList;