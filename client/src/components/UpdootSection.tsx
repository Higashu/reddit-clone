import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Flex, Text } from '@chakra-ui/react';
import React from 'react';
import { PostFragment, PostSnippetFragment, useVoteMutation } from '../generated/graphql';

interface UpdootSectionProps {
  post: PostSnippetFragment | PostFragment;
}

const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  const [_, vote] = useVoteMutation();

  return (
    <Flex align='center'>
      <ChevronUpIcon
        w={8}
        h={8}
        cursor='pointer'
        _hover={{ transform: 'scale(1.2)' }}
        color={post.voteStatus === 1 ? 'green' : undefined}
        onClick={() => {
          if (post.voteStatus !== 1) {
            vote({ postId: post.id, value: 1 });
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
        onClick={() => {
          if (post.voteStatus !== -1) {
            vote({ postId: post.id, value: -1 });
          }
        }}
      />
    </Flex>
  );
};

export default UpdootSection;
