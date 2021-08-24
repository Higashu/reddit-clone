import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import EditDeletePostButtons from '../../components/EditDeletePostButtons';
import { Layout } from '../../components/Layout';
import { useGetPostFromUrl } from '../../utils/useGetPostFromUrl';
import { withApollo } from '../../utils/withApollo';

const Post: React.FC<{}> = ({}) => {
  const { data, loading } = useGetPostFromUrl();

  if (loading) {
    return (
      <Layout>
        <Text>Loading...</Text>
      </Layout>
    );
  }

  if (!data?.post) {
    return (
      <Layout>
        <div>Could not find post</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Flex justifyContent='space-between' alignItems='center'>
        <Heading>{data.post.title}</Heading>
        <Box>
          <EditDeletePostButtons
            id={data.post.id}
            creatorId={data.post.creator.id}
          />
        </Box>
      </Flex>
      <Text mt={4}>{data.post.text}</Text>
    </Layout>
  );
};

export default withApollo({ ssr: true })(Post);
