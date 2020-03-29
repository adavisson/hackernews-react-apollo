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
          createdAt
          url
          description
          postedBy {
            id
            name
          }
          votes {
            id
            user {
              id
            }
          }
        }
      }
    }
  `

  const _updateCacheAfterVote = (store, createVote, linkId) => {
    const data = store.readQuery({ query: FEED_QUERY })

    const votedLink = data.feed.links.find(link => link.id === linkId)
    votedLink.votes = createVote.link.votes
    
    store.writeQuery({ query: FEED_QUERY, data })
  }

  return (
    <div>
      <Query query={FEED_QUERY}>
        {({ loading, error, data}) => {
          if (loading) return <div>Fetching</div>
          if (error) return <div>Error</div>

          const linksToRender = data.feed.links

          return (
            <div>
              {linksToRender.map((link, index) => {
                return (
                  <Link
                    key={link.id}
                    link={link}
                    index={index}
                    updateStoreAfterVote={_updateCacheAfterVote}
                  />
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