import { Box, Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/dist/client/router';
import InputField from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useRegisterMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { toErrorMap } from '../utils/toErrorMap';

interface registerProps {}


const Register: React.FC<registerProps> = ({}) => {
  const router = useRouter();
  const [_, register] = useRegisterMutation();
  return (
    <Wrapper>
      <Formik
        initialValues={{ username: '', password: '', email:'' }}
        onSubmit={async (values,{setErrors}) => {
          const response = await register({
            username: values.username,
            password: values.password,
            email:values.email,
          });
          if(response.data?.register.errors){
            setErrors(toErrorMap(response.data.register.errors));
          } else if (response.data?.register.user){
            router.push('/');
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name='username'
              placeholder='username'
              label='Username'
            />
            <Box mt={4}>
              <InputField
                name='email'
                placeholder='email'
                label='email'
                type='Email'
              />
            </Box>
            <Box mt={4}>
              <InputField
                name='password'
                placeholder='password'
                label='Password'
                type='password'
              />
            </Box>
            <Button mt={4} type='submit' isLoading={isSubmitting}>
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient) (Register);
