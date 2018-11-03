var test = require('tape')

var planner = require('../../src/create/_planner')
var base = {
  app: ['mah-app']
}

test('create planner returns default plans', t=> {
  var arc = Object.assign({}, base)
  t.plan(4)
  var plans = planner(arc)
  t.deepEqual(plans.filter(x => x.action === 'create-iam-role')[0], {action:'create-iam-role', app: base.app[0]},  'contains create iam role')
  t.deepEqual(plans.filter(x => x.action === 'create-shared')[0], {action:'create-shared', app: base.app[0]},  'contains create shared')
  t.deepEqual(plans.filter(x => x.action === 'create-public')[0], {action:'create-public', app: base.app[0]},  'contains create public')
  t.deepEqual(plans.filter(x => x.action === 'create-views')[0], {action:'create-views', app: base.app[0]},  'contains create views')
  t.end()
})
test('create planner returns sns event plans', t=> {
  var arc = Object.assign({
    events: ['bing', 'bong']
  }, base)
  t.plan(7)
  var plans = planner(arc)
  var lambdacodeplans = plans.filter(x => x.action === 'create-event-lambda-code')
  t.deepEqual(lambdacodeplans[0], {action:'create-event-lambda-code', app: base.app[0], event:'bing'},  'contains create lambda code with first of two events')
  t.deepEqual(lambdacodeplans[1], {action:'create-event-lambda-code', app: base.app[0], event:'bong'},  'contains create lambda code with second of two events')
  var createeventplans = plans.filter(x => x.action === 'create-events')
  t.deepEqual(createeventplans[0], {action:'create-events', app: base.app[0], event:'bing'},  'contains create events with first of two events')
  t.deepEqual(createeventplans[1], {action:'create-events', app: base.app[0], event:'bong'},  'contains create events with second of two events')
  var createdeployplans = plans.filter(x => x.action === 'create-event-lambda-deployments')
  t.deepEqual(createdeployplans[0], {action:'create-event-lambda-deployments', app: base.app[0], event:'bing'},  'contains event lambda deployments with first of two events')
  t.deepEqual(createdeployplans[1], {action:'create-event-lambda-deployments', app: base.app[0], event:'bong'},  'contains event lambda deployments with second of two events')
  t.equal(plans.length, 10, 'create 3 plans for each event in this scenario') // 6 for the events and 4 from the default plans
  t.end()
})
test('create planner returns subset of sns event plans when arc local env var is set', t=> {
  var arc = Object.assign({
    events: ['bing', 'bong']
  }, base)
  process.env.ARC_LOCAL = 'true'
  t.plan(3)
  var plans = planner(arc)
  var lambdacodeplans = plans.filter(x => x.action === 'create-event-lambda-code')
  t.deepEqual(lambdacodeplans[0], {action:'create-event-lambda-code', app: base.app[0], event:'bing'},  'contains create lambda code with first of two events')
  t.deepEqual(lambdacodeplans[1], {action:'create-event-lambda-code', app: base.app[0], event:'bong'},  'contains create lambda code with second of two events')
  t.equal(plans.length, 6, 'only create-event-lambda-code events exist in this scenario') // 2 for the events and 4 from the default plans
  delete process.env.ARC_LOCAL
  t.end()
})
test('create planner returns queue plans', t=> {
  t.end()
})
test('create planner returns scheduled plans', t=> {
  var arc = Object.assign({
    scheduled: ['bing', 'bong']
  }, base)
  t.plan(5)
  var plans = planner(arc)
  var lambdacodeplans = plans.filter(x => x.action === 'create-scheduled-lambda-code')
  t.deepEqual(lambdacodeplans[0], {action:'create-scheduled-lambda-code', app: base.app[0], scheduled:'bing'},  'contains create lambda code with first of two schedules')
  t.deepEqual(lambdacodeplans[1], {action:'create-scheduled-lambda-code', app: base.app[0], scheduled:'bong'},  'contains create lambda code with second of two schedules')
  var lambdadeployplans = plans.filter(x => x.action === 'create-scheduled-lambda-deployments')
  t.deepEqual(lambdadeployplans[0], {action:'create-scheduled-lambda-deployments', app: base.app[0], scheduled:'bing'},  'contains create lambda deployment with first of two schedules')
  t.deepEqual(lambdadeployplans[1], {action:'create-scheduled-lambda-deployments', app: base.app[0], scheduled:'bong'},  'contains create lambda deployment with second of two schedules')
  t.equal(plans.length, 8, 'only create-scheduled-lambda-code events exist in this scenario') // 2 for the events and 4 from the default plans
  t.end()
})
test('create planner does not return scheduled lambda deployment plans when arc local env var is set', t=> {
  var arc = Object.assign({
    scheduled: ['bing', 'bong']
  }, base)
  process.env.ARC_LOCAL = 'true'
  t.plan(4)
  var plans = planner(arc)
  var lambdacodeplans = plans.filter(x => x.action === 'create-scheduled-lambda-code')
  t.equal(plans.filter(x => x.action === 'create-scheduled-lambda-deployments').length, 0, 'no create-scheduled-lambda-deployment events exist')
  t.deepEqual(lambdacodeplans[0], {action:'create-scheduled-lambda-code', app: base.app[0], scheduled:'bing'},  'contains create lambda code with first of two events')
  t.deepEqual(lambdacodeplans[1], {action:'create-scheduled-lambda-code', app: base.app[0], scheduled:'bong'},  'contains create lambda code with second of two events')
  t.equal(plans.length, 6, 'only create-event-lambda-code events exist in this scenario') // 2 for the events and 4 from the default plans
  delete process.env.ARC_LOCAL
  t.end()
})
test('create planner returns static (s3 bucket) plans', t=> {
  t.end()
})
test('create planner returns http lambda code plans', t=> {
  var arc = Object.assign({
    http: [['get', '/'], ['post', '/post']]
  }, base)
  t.plan(5)
  var plans = planner(arc)
  var createcodeplans = plans.filter(x => x.action === 'create-http-lambda-code')
  t.deepEqual(createcodeplans[0], {action:'create-http-lambda-code', app: base.app[0], route:arc.http[0]},  'contains create lambda code with first of two routes')
  t.deepEqual(createcodeplans[1], {action:'create-http-lambda-code', app: base.app[0], route:arc.http[1]},  'contains create lambda code with second of two routes')
  var createdeployplans = plans.filter(x => x.action === 'create-http-lambda-deployments')
  t.deepEqual(createdeployplans[0], {action:'create-http-lambda-deployments', app: base.app[0], route:arc.http[0]},  'contains create lambda deployment with first of two routes')
  t.deepEqual(createdeployplans[1], {action:'create-http-lambda-deployments', app: base.app[0], route:arc.http[1]},  'contains create lambda deployment with second of two routes')
  t.equal(plans.length, 13, 'create-lambda code and deployment events exist') // 2 lambda code and 2 lambda deploy exist (one for each route), 4 default plans, 1 session table, 1 for routers, 2 http routes (one for each route) plus 1 router deployments
  t.end()
})
test('create planner does not return http lambda deployment plans if arc local env var is set', t=> {
  var arc = Object.assign({
    http: [['get', '/'], ['post', '/post']]
  }, base)
  process.env.ARC_LOCAL = 'true'
  t.plan(3)
  var plans = planner(arc)
  var createdeployplans = plans.filter(x => x.action === 'create-http-lambda-deployments')
  var createcodeplans = plans.filter(x => x.action === 'create-http-lambda-code')
  t.equal(createdeployplans.length, 0, 'no http lambda code deployment events exist')
  t.equal(createcodeplans.length, 2, 'two http lambda code creation events exist')
  t.equal(plans.length, 6, 'create-lambda code and deployment events exist') // 2 lambda code (one for each route) and 4 default plans
  delete process.env.ARC_LOCAL
  t.end()
})
test('create planner returns http route creation plans if arc local env var is not set', t=> {
  var arc = Object.assign({
    http: [['get', '/'], ['post', '/post']]
  }, base)
  t.plan(4)
  var plans = planner(arc)
  var createroutersplan = plans.filter(x => x.action === 'create-routers')
  t.deepEqual(createroutersplan[0], {action:'create-routers', app: base.app[0]},  'contains create routers plan')
  var createhttprouteplans = plans.filter(x => x.action === 'create-http-route')
  t.deepEqual(createhttprouteplans[0], {action:'create-http-route', app: base.app[0], route:arc.http[0]},  'contains create http route with first of two routes')
  t.deepEqual(createhttprouteplans[1], {action:'create-http-route', app: base.app[0], route:arc.http[1]},  'contains create http route with second of two routes')
  var createrouterdeployplan = plans.filter(x => x.action === 'create-router-deployments')
  t.deepEqual(createrouterdeployplan[0], {action:'create-router-deployments', app: base.app[0]},  'contains create router deployments plan')
  t.end()
})
test('create planner returns session table creation plans if arc file contains http or slack', t=> {
  t.end()
})
test('create planner ignores session table creation plans if disable session env var is set', t=> {
  t.end()
})
test('create planner ignores session table creation plans if arc local env var is set', t=> {
  t.end()
})
test('create planner returns table plans', t=> {
  t.end()
})
test('create planner returns index plans', t=> {
  t.end()
})
test('create planner ignores index plans if arc local env var is set', t=> {
  t.end()
})
test('create planner returns router deployment plans if arc file contains slack pragma', t=> {
  t.end()
})