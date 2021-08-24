import { ApolloCache } from '@apollo/client';
import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Flex, Text } from '@chakra-ui/react';
import gql from 'graphql-tag';
import React from 'react';
import {
  PostFragment,
  PostSnippetFragment,
  useVoteMutation,
  VoteMutation,
} from '../generated/graphql';

interface UpdootSectionProps {
  post: PostSnippetFragment | PostFragment;
}

const updateAfterVote = (
  value: number,
  postId: number,
  cache: ApolloCache<VoteMutation>
) => {
  const data = cache.readFragment<{
    id: number;
    points: number;
    voteStatus: number | null;
  }>({
    id: 'Post:' + postId,
    fragment: gql`
      fragment _ on Post {
        id
        points
        voteStatus
      }
    `,
  });
  if (data) {
    if (data.voteStatus === value) {
      return;
    }
    const newPoints =
      (data.points as number) + (!data.voteStatus ? 1 : 2) * value;
    cache.writeFragment({
      id: 'Post:' + postId,
      fragment: gql`
        fragment __ on Post {
          points
          voteStatus
        }
      `,
      data: { points: newPoints, voteStatus: value },
    });
  }
};

const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  const [vote] = useVoteMutation();

  return (
    <Flex align='center'>
      <ChevronUpIcon
        w={8}
        h={8}
        cursor='pointer'
        _hover={{ transform: 'scale(1.2)' }}
        color={post.voteStatus === 1 ? 'green' : undefined}
        onClick={async () => {
          if (post.voteStatus !== 1) {
            await vote({
              variables: { postId: post.id, value: 1 },
              update: (cache) => updateAfterVote(1, post.id, cache),
            });
          }
        }}
      />
      <Text fontSize='sm' fontWeight='bold'>
        {post.points}
      </Text>
      <ChevronDownIcon
        w={8}
        h={8}
        cursor='pointer'
        _hover={{ transform: 'scale(1.2)' }}
        color={post.voteStatus === -1 ? 'tomato' : undefined}
        onClick={async () => {
          if (post.voteStatus !== -1) {
            await vote({
              variables: { postId: post.id, value: -1 },
              update: (cache) => updateAfterVote(-1, post.id, cache),
            });
          }
        }}
      />
    </Flex>
  );
};

export default UpdootSection;
