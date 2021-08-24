import { Link } from '@chakra-ui/layout';
import { Box, Button, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import NextLink from 'next/link';
import EditDeletePostButtons from '../components/EditDeletePostButtons';
import { Layout } from '../components/Layout';
import UpdootSection from '../components/UpdootSection';
import { usePostsQuery } from '../generated/graphql';
import { withApollo } from '../utils/withApollo';

const Index = () => {
  const { data, loading, fetchMore, variables } = usePostsQuery({
    variables: {
      limit: 10,
      cursor: null,
    },
    notifyOnNetworkStatusChange: true,
  });

  if (!loading && !data) {
    return <div>Oops, something went wrong...</div>;
  }

  return (
    <Layout>
      <Flex align='center' mb='6'>
        <Heading fontSize='2xl'>Your feed</Heading>
        <NextLink href='/create-post'>
          <Button ml='auto' as={Link}>
            Create post
          </Button>
        </NextLink>
      </Flex>
      <Stack spacing={8}>
        {!data && loading ? (
          <div>loading...</div>
        ) : (
          data!.posts.posts.map((post) =>
            !post ? null : (
              <Box key={post.id} p={5} shadow='md' borderWidth='1px'>
                <Flex justifyContent='space-between' alignItems='center'>
                  <NextLink href='/post/[id]' as={`/post/${post.id}`}>
                    <Link>
                      <Heading fontSize='xl'>{post.title}</Heading>
                    </Link>
                  </NextLink>
                  <Box>
                    <EditDeletePostButtons
                      id={post.id}
                      creatorId={post.creator.id}
                    />
                  </Box>
                </Flex>
                <Text mt={4}>{post.textSnippet}</Text>
                <Flex align='center' mt={4} justifyContent='space-between'>
                  <UpdootSection post={post} />
                  <Text textAlign='right'>
                    Posted by {post.creator.username}
                  </Text>
                </Flex>
              </Box>
            )
          )
        )}
      </Stack>
      {data && data.posts.hasMore && (
        <Flex>
          <Button
            onClick={() => {
              fetchMore({
                variables: {
                  limit: variables?.limit,
                  cursor:
                    data.posts.posts[data.posts.posts.length - 1].createdAt,
                },
                // Deprecated
                // updateQuery: (
                //   previousValue,
                //   { fetchMoreResult }
                // ): PostsQuery => {
                //   if (!fetchMoreResult) {
                //     return previousValue as PostsQuery;
                //   }
                //   return {
                //     __typename: 'Query',
                //     posts: {
                //       __typename: 'PaginatedPosts',
                //       hasMore: (fetchMoreResult as PostsQuery).posts.hasMore,
                //       posts: [
                //         ...(previousValue as PostsQuery).posts.posts,
                //         ...(fetchMoreResult as PostsQuery).posts.posts,
                //       ],
                //     },
                //   };
                // },
              });
            }}
            isLoading={loading}
            m='auto'
            my={8}
          >
            Load more
          </Button>
        </Flex>
      )}
    </Layout>
  );
};

export default withApollo({ ssr: true })(Index);
