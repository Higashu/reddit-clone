export const validateRegister = (
  username: string,
  password: string,
  email: string
) => {
  const emailRegExp = new RegExp(
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    'g'
  );

  if (!emailRegExp.test(email)) {
    return [
      {
        field: 'email',
        message: 'invalide email',
      },
    ];
  }

  if (username.trim().length <= 2) {
    return [
      {
        field: 'username',
        message: 'length must be greater than 2',
      },
    ];
  }

  if (username.includes('@')) {
    return [
      {
        field: 'username',
        message: 'cannot include an @ sign',
      },
    ];
  }

  if (password.trim().length <= 3) {
    return [
      {
        field: 'password',
        message: 'length must be greater than 3',
      },
    ];
  }

  return null;
};
