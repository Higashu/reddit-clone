import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import NextLink from 'next/link';
import React from 'react';
import { useDeletePostMutation, useMeQuery } from '../generated/graphql';

interface EditDeletePostButtonsProps {
  id: number;
  creatorId: number;
}

const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({
  id,
  creatorId,
}) => {
  const [{ data: meData }] = useMeQuery();

  const [_, deletePost] = useDeletePostMutation();

  if (meData?.me?.id !== creatorId) {
    return null;
  }

  return (
    <>
      <NextLink href='/post/edit/[id]' as={`/post/edit/${id}`}>
        <EditIcon
          w={5}
          h={5}
          mr={3}
          cursor='pointer'
          _hover={{ transform: 'scale(1.2)' }}
          color='black'
        />
      </NextLink>
      <DeleteIcon
        w={5}
        h={5}
        color='tomato'
        cursor='pointer'
        _hover={{ transform: 'scale(1.2)' }}
        onClick={() => {
          deletePost({ id: id });
        }}
      />
    </>
  );
};

export default EditDeletePostButtons;
