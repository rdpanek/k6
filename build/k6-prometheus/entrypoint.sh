#!/bin/bash

if [[ -z "${TEST_PLAN_NAME}" ]]; then
  export TEST_PLAN_NAME='baseline.js'
fi

if [ "${ENV_PRINT}" == "allow" ] ; then
  echo "Print all environment variables"
  env
fi

if [[ -z "${GIT_TEST_REPOSITORY}" ]]; then
  echo "Without git clone."
  ls -lah $K6_TESTS
else
  echo "Git clone your repository with tests."
  # setup git
  export GIT_TRACE=0

  cd $K6_TESTS
  git clone $GIT_TEST_REPOSITORY $K6_TESTS
  ls -lah $K6_TESTS

  # select version of test by revision or branch name
  ( cd $K6_TESTS && git fetch && git checkout $GIT_REVISION )
fi

# start k6
k6 run ${K6_TESTS}/${TEST_PLAN_NAME} --out 'prometheus=namespace=k6' --no-usage-report