# k6.io
> Scripts for K6 training.


## Examples

### BattlePage

Create user defined network
`docker network create k6`

Run BattlePage (demo web)
`docker run -d --rm -p 80:80 -p 443:443 --net k6 --name battle quay.io/canarytrace/battle-page:1.3`

## How to run
- `k6 run boilerplate/baseline.js` or
- `docker run --name k6 -i --rm -v $(pwd):/home/k6/ --net k6 -e ENVIRONMENT=http://battle/ -e TEST_PLAN_NAME=boilerplate/baseline.js quay.io/rdpanek/k6:0.37.0.2`

## How to run with clone public git repository with tests
> this command download repository, than checkout on revision and run k6
- `docker run --name k6 -it --rm --net k6 -e GIT_TEST_REPOSITORY=https://github.com/rdpanek/k6.git -e GIT_REVISION=9f76f05 -e TEST_PLAN_NAME=boilerplate/baseline.js -e ENVIRONMENT=http://battle/ quay.io/rdpanek/k6:0.37.0.2`