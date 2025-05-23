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

if [ -n "$GIT_TOKEN" ]; then
  GIT_TEST_REPOSITORY=$(echo $GIT_TEST_REPOSITORY | sed "s#https://#https://oauth2:$GIT_TOKEN@#")
  export GIT_TEST_REPOSITORY
fi

if [ "${ENV_PRINT}" == "allow" ] ; then
  echo "Print all environment variables"
  env
fi

# setup git
export GIT_TRACE=0

cd $K6_HOME
git clone $GIT_TEST_REPOSITORY $K6_HOME/tests
ls -lah $K6_HOME/tests

# select version of test by revision or branch name
( cd $K6_HOME/tests && git fetch && git checkout $GIT_REVISION )
ls -lah $K6_HOME/tests

# start k6
cd $K6_HOME
k6 run ./tests/$TEST_PLAN_NAME $@

if [ "${STOP_AFTER_TEST}" == "allow" ] ; then
  sleep 3600
fi