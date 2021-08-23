import { ChevronUpIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Flex, Text } from '@chakra-ui/react';
import React from 'react';
import { PostSnippetFragment, PostsQuery } from '../generated/graphql';

interface UpdootSectionProps {
    post: PostSnippetFragment;
}

const UpdootSection: React.FC<UpdootSectionProps> = ({post}) => {
    

  return (
    <Flex align='center'>
      <ChevronUpIcon w={8} h={8} cursor='pointer' />
      <Text fontSize='sm' fontWeight='bold'>
        {post.points}
      </Text>
      <ChevronDownIcon w={8} h={8} cursor='pointer' />
    </Flex>
  );
};

export default UpdootSection;
