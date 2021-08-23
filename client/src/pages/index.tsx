import { withUrqlClient } from 'next-urql';
import { Layout } from '../components/Layout';
import { usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import NextLink from 'next/link';
import { Link } from '@chakra-ui/layout';
import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import UpdootSection from '../components/UpdootSection';

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
        <Heading>Lireddit</Heading>
        <NextLink href='/create-post'>
          <Link ml='auto'>create post</Link>
        </NextLink>
      </Flex>
      <Stack spacing={8}>
        {!data && fetching ? (
          <div>loading...</div>
        ) : (
          data!.posts.posts.map((post) => (
            <Box key={post.id} p={5} shadow='md' borderWidth='1px'>
              <Heading fontSize='xl'>{post.title}</Heading>
              <Text mt={4}>{post.textSnippet}</Text>
              <Flex align='center' mt={4} justifyContent='space-between'>
                <UpdootSection post={post} />
                <Text textAlign='right'>Posted by {post.creator.username}</Text>
              </Flex>
            </Box>
          ))
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
