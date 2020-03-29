import React from 'react';
import Link from './Link';
import { Query } from 'react-apollo';
import { gql } from 'apollo-boost';

export const FEED_QUERY = gql`
  query FeedQuery($first: Int, $skip: Int, $orderBy: LinkOrderByInput) {
    feed(first: $first, skip: $skip, orderBy: $orderBy) {
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
      count
    }
  }
`

const NEW_LINKS_SUBSCRIPTION = gql`
  subscription {
    newLink {
      id
      url
      description
      createdAt
      postedBy {
        id
        name
      } votes {
        id
        user {
          id
        }
      }
    }
  }
`

const NEW_VOTES_SUBSCRIPTION = gql`
  subscription {
    newVote {
      id
      link {
        id
        url
        description
        createdAt
        postedby {
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
      user {
        id
      }
    }
  }
`

const LinkList = (props) => {
  const _updateCacheAfterVote = (store, createVote, linkId) => {
    const data = store.readQuery({ query: FEED_QUERY })

    const votedLink = data.feed.links.find(link => link.id === linkId)
    votedLink.votes = createVote.link.votes
    
    store.writeQuery({ query: FEED_QUERY, data })
  }

  const _subscribeToNewLinks = subscribeToMore => {
    subscribeToMore({
      document: NEW_LINKS_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        const newLink = subscriptionData.data.newLink
        const exists = prev.feed.links.find(({ id}) => id === newLink.id);
        if(exists) return prev;

        return Object.assign({}, prev, {
          feed: {
            links: [newLink, ...prev.feed.links],
            count: prev.feed.links.length + 1,
            __typename: prev.feed.__typename
          }
        })
      }
    })
  }

  const _subscribeToNewVotes = subscribeToMore => {
    subscribeToMore({
      document: NEW_VOTES_SUBSCRIPTION
    })
  }

  const _getQueryVariables = () => {
    const isNewPage = props.location.pathname.includes('new')
    const page = parseInt(props.match.params.page, 10)

    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0
    const first = isNewPage ? LINKS_PER_PAGE : 100
    const orderBy = isNewPage ? 'createdAt_DESC' : null
    return { first, skip, orderBy }
  }

  return (
    <div>
      <Query query={FEED_QUERY} variables={_getQueryVariables()}>
        {({ loading, error, data, subscribeToMore}) => {
          if (loading) return <div>Fetching</div>
          if (error) return <div>Error</div>

          _subscribeToNewLinks(subscribeToMore)
          _subscribeToNewVotes(subscribeToMore)

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