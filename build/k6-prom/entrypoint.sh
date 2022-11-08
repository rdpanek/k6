#!/bin/sh

if [[ -z "${TRACE_ID}" ]]; then
  export TRACE_ID=${GIT_REVISION}
  i=${#TRACE_ID}
  while [ "$i" -lt 32 ]; do TRACE_ID=${TRACE_ID}0; i=$(( i + 1 )); done
fi

export POD_ID=$( echo $HOSTNAME | sed 's/k6-//g')

if [[ -z "${TEST_PLAN_NAME}" ]]; then
  export TEST_PLAN_NAME='baseline.js'
fi

if [ "${ENV_PRINT}" == "allow" ] ; then
  echo "Print all environment variables"
  env
fi

if [[ -z "${GIT_TEST_REPOSITORY}" ]]; then
  echo "Without git clone."
  ls -lah $K6_HOME
else
  echo "Git clone your repository with tests."
  # setup git
  export GIT_TRACE=0

  cd $K6_HOME
  git clone $GIT_TEST_REPOSITORY $K6_HOME
  ls -lah $K6_HOME

  # select version of test by revision or branch name
  ( cd $K6_HOME && git fetch && git checkout $GIT_REVISION )
  ls -lah $K6_HOME
fi

# start k6
k6 run $TEST_PLAN_NAME $@

if [ "${STOP_AFTER_TEST}" == "allow" ] ; then
  sleep 3600
fi