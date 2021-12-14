#!/bin/sh

if [ "${ENV_PRINT}" == "allow" ] ; then
  echo "Print all environment variables"
  env
fi

# setup git
export GIT_TRACE=0

git config --global credential.helper '!aws codecommit credential-helper $@'
git config --global credential.UseHttpPath true
cd $K6_HOME
git clone $GIT_TEST_REPOSITORY $K6_HOME
ls -lah $K6_HOME

# select version of test by revision or branch name
( cd $K6_HOME && git fetch && git checkout $GIT_REVISION )

# start k6
k6 run $TEST_PLAN_NAME --out=statsd --no-usage-report