import { Link } from '@chakra-ui/layout';
import { Box, Button, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import { useState } from 'react';
import EditDeletePostButtons from '../components/EditDeletePostButtons';
import { Layout } from '../components/Layout';
import UpdootSection from '../components/UpdootSection';
import { usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null as null | string,
  });

  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  if (!fetching && !data) {
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
        {!data && fetching ? (
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
              setVariables({
                limit: variables.limit,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              });
            }}
            isLoading={fetching}
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

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
