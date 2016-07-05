var twilio = require('../index'),
    jwt = require('jwt-simple');

describe('The TaskRouter Capability Deprecated Token Object', function() {

    it('should allow construction of a capability token', function() {
        var c = new twilio.TaskRouterCapability('AC123', 'foobar', 'WS456', 'WK789');
        var token = c.generate();

        var decoded = jwt.decode(token, 'foobar');
        expect(decoded).toBeDefined();
        expect(decoded['iss']).toBe('AC123');
        expect(decoded['account_sid']).toBe('AC123');
        expect(decoded['channel']).toBe('WK789');
        expect(decoded['workspace_sid']).toBe('WS456');
        expect(decoded['worker_sid']).toBe('WK789');
        expect(decoded['version']).toBe('v1');
        expect(decoded['exp']).toEqual(Math.floor(new Date() / 1000) + 3600);
    });

    it('should accept custom ttls', function() {
        var c = new twilio.TaskRouterCapability('AC123', 'foobar', 'WS456', 'WK789');
        var token = c.generate(1000);
        var decoded = jwt.decode(token, 'foobar');
        expect(decoded['exp']).toEqual(Math.floor(new Date() / 1000) + 1000);
    });

    it('should allow websocket and activities access as well as worker activity updates and reservation updates', function() {
        var c = new twilio.TaskRouterCapability('AC123', 'foobar', 'WS456', 'WK789');
        c.allowWorkerActivityUpdates();
        c.allowTaskReservationUpdates();
        var token = c.generate();

        var decoded = jwt.decode(token, 'foobar');
        expect(decoded['policies'].length).toBe(9);
        var activitiesPolicy = {
            url: 'https://taskrouter.twilio.com/v1/Workspaces/WS456/Activities',
            method: 'GET',
            query_filter: {},
            post_filter: {},
            allow: true
        };
        expect(decoded['policies'][0]).toEqual(activitiesPolicy);

        var tasksFetchPolicy = {
            url: 'https://taskrouter.twilio.com/v1/Workspaces/WS456/Tasks/**',
            method: 'GET',
            query_filter: {},
            post_filter: {},
            allow: true
        };
        expect(decoded['policies'][1]).toEqual(tasksFetchPolicy);

        var workerReservationsFetchPolicy = {
            url: 'https://taskrouter.twilio.com/v1/Workspaces/WS456/Workers/WK789/Reservations/**',
            method: 'GET',
            query_filter: {},
            post_filter: {},
            allow: true
        };
        expect(decoded['policies'][2]).toEqual(workerReservationsFetchPolicy);

        var getPolicy = {
            url: 'https://event-bridge.twilio.com/v1/wschannels/AC123/WK789',
            method: 'GET',
            query_filter: {},
            post_filter: {},
            allow: true
        };
        expect(decoded['policies'][4]).toEqual(getPolicy);

        var postPolicy = {
            url: 'https://event-bridge.twilio.com/v1/wschannels/AC123/WK789',
            method: 'POST',
            query_filter: {},
            post_filter: {},
            allow: true
        };
        expect(decoded['policies'][5]).toEqual(postPolicy);

        var workerFetchPolicy = {
            url: 'https://taskrouter.twilio.com/v1/Workspaces/WS456/Workers/WK789',
            method: 'GET',
            query_filter: {},
            post_filter: {},
            allow: true
        };
        expect(decoded['policies'][6]).toEqual(workerFetchPolicy);

        var workerUpdatesPolicy = {
            url: 'https://taskrouter.twilio.com/v1/Workspaces/WS456/Workers/WK789',
            method: 'POST',
            query_filter: {},
            post_filter: {'ActivitySid': {'required': true}},
            allow: true
        };
        expect(decoded['policies'][7]).toEqual(workerUpdatesPolicy);

        var taskPolicy = {
            url: 'https://taskrouter.twilio.com/v1/Workspaces/WS456/Tasks/**',
            method: 'POST',
            query_filter: {},
            post_filter: {},
            allow: true
        };

        expect(decoded['policies'][8]).toEqual(taskPolicy);
    });
});
