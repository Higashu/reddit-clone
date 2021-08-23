import { Box, Button } from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import { withUrqlClient } from 'next-urql';
import router from 'next/dist/client/router';
import React from 'react';
import InputField from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { createUrqlClient } from '../utils/createUrqlClient';
import { toErrorMap } from '../utils/toErrorMap';
import login from './login';
import { useForgotPasswordMutation } from '../generated/graphql';
import { useState } from 'react';

const ForgotPassword: React.FC<{}> = ({}) => {
  const [_, forgotPassword] = useForgotPasswordMutation();
  const [complete, setComplete] = useState(false);

  return (
    <Wrapper>
      <Formik
        initialValues={{ email: '' }}
        onSubmit={async (values, { setErrors }) => {
          await forgotPassword({
            email: values.email,
          });
          setComplete(true);
        }}
      >
        {({ isSubmitting }) =>
          complete ? (
            <Box>
              If an account with that email exists, we sent you an email
            </Box>
          ) : (
            <Form>
              <InputField
                name='email'
                placeholder='email'
                label='Email'
                type='email'
              />
              <Button mt={4} type='submit' isLoading={isSubmitting}>
                forgot password
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
