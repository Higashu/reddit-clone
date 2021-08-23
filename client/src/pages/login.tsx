import { Box, Button, Flex, Link } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/dist/client/router';
import InputField from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useLoginMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { toErrorMap } from '../utils/toErrorMap';
import NextLink from 'next/link'

const Login: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [_,login] = useLoginMutation();
  return (
    <Wrapper>
      <Formik
        initialValues={{ usernameOrEmail: '', password: '' }}
        onSubmit={async (values,{setErrors}) => {
          const response = await login({
            usernameOrEmail: values.usernameOrEmail,
            password: values.password,
          });
          if(response.data?.login.errors){
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user){
            router.push('/');
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name='usernameOrEmail'
              placeholder='username or email'
              label='Username or Email'
            />
            <Box mt={4}>
              <InputField
                name='password'
                placeholder='password'
                label='Password'
                type='password'
              />
            </Box>
            <Flex>
            <NextLink href='/forgot-password'>
              <Link ml='auto' mt={2}>Forgot password?</Link>
            </NextLink>
            </Flex>
            <Button mt={4} type='submit' isLoading={isSubmitting}>
              login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient) (Login);
