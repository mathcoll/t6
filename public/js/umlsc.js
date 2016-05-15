var graph = new joint.dia.Graph();

var paper = new joint.dia.Paper({
    el: $('#paper'),
    gridSize: 15,
    width: '100%',
    height: 800,
    perpendicularLinks: true,
    interactive: false,
    model: graph
});

var uml = joint.shapes.uml;

var states = {
    s0: new uml.StartState({
        position: { x:(800-25)/2, y: 0 },
        size: { width: 25, height: 25 },
        attrs: {
            'circle': {
                fill: '#000',
                stroke: 'none'
            }
        }
    }),

    s1: new uml.State({
        position: { x:(800-500)/2, y: 50 },
        size: { width: 500, height: 50 },
        name: "Watch",
        events: [
                 "Mqtt topic: couleurs/yoctovoc/voc"
        ],
        attrs: {
            '.uml-state-body': {
                fill: '#ffffff',
                stroke: '#337ab7',
                'stroke-width': 5
            },
            '.uml-state-separator': {
                stroke: '#337ab7'
            }
        }
    }),

    s2a: new uml.State({
        position: { x:(800-500)/2, y: 150 },
        size: { width: 500, height: 50 },
        name: "Condition",
        events: [
            "this"
        ],
        attrs: {
            '.uml-state-body': {
                fill: '#ffffff',
                stroke: '#5cb85c',
                'stroke-width': 5
            },
            '.uml-state-separator': {
                stroke: '#5cb85c'
            }
        }
    }),

    s2b: new uml.State({
        position: { x:(800-500)/2, y: 250 },
        size: { width: 500, height: 50 },
        name: "Condition",
        events: [
            "(this.mqtt_topic === 'couleurs/yoctovoc/voc')"
        ],
        attrs: {
            '.uml-state-body': {
                fill: '#ffffff',
                stroke: '#5cb85c',
                'stroke-width': 5
            },
            '.uml-state-separator': {
                stroke: '#5cb85c'
            }
        }
    }),

    s2c: new uml.State({
        position: { x:(800-500)/2, y: 350 },
        size: { width: 500, height: 50 },
        name: "Condition",
        events: [
            "(this.value < 600)"
        ],
        attrs: {
            '.uml-state-body': {
                fill: '#ffffff',
                stroke: '#5cb85c',
                'stroke-width': 5
            },
            '.uml-state-separator': {
                stroke: '#5cb85c'
            }
        }
    }),

    s2d: new uml.State({
        position: { x:(800-500)/2, y: 450 },
        size: { width: 500, height: 50 },
        name: "Condition",
        events: [
            "this.modules.environment === 'development'"
        ],
        attrs: {
            '.uml-state-body': {
                fill: '#ffffff',
                stroke: '#5cb85c',
                'stroke-width': 5
            },
            '.uml-state-separator': {
                stroke: '#5cb85c'
            }
        }
    }),

    s3: new uml.State({
        position: { x:(800-500)/2, y: 550 },
        size: { width: 500, height: 50 },
        name: "Actions",
        events: [
            "this.modules.outputSerial(this.arduinoPayload);"
        ],
        attrs: {
            '.uml-state-body': {
                fill: '#ffffff',
                stroke: '#5bc0de',
                'stroke-width': 5
            },
            '.uml-state-separator': {
                stroke: '#5bc0de'
            }
        }
    }),

    se: new uml.EndState({
        position: { x:(800-25)/2, y: 650 },
        size: { width: 25, height: 25 },
        attrs: {
            '.outer': {
                stroke: "#4b4a67",
                'stroke-width': 2
            },
            '.inner': {
                fill: '#4b4a67'
            }
        }
    })
};

graph.addCells(states);

var linkAttrs =  {
	'fill': 'none',
	'stroke-linejoin': 'round',
	'stroke-width': '3',
	'stroke': '#cdcdcd'
};

var transitons = [
    new uml.Transition({
        source: { id: states.s0.id },
        target: { id: states.s1.id },
        attrs: {'.connection': linkAttrs }
    }),
    new uml.Transition({
        source: { id: states.s1.id },
        target: { id: states.s2a.id },
        attrs: {'.connection': linkAttrs }
    }),
    new uml.Transition({
        source: { id: states.s2a.id },
        target: { id: states.s2b.id },
        attrs: {'.connection': linkAttrs }
    }),
    new uml.Transition({
        source: { id: states.s2b.id },
        target: { id: states.s2c.id },
        attrs: {'.connection': linkAttrs }
    }),
    new uml.Transition({
        source: { id: states.s2c.id },
        target: { id: states.s2d.id },
        attrs: {'.connection': linkAttrs }
    }),
    new uml.Transition({
        source: { id: states.s2d.id },
        target: { id: states.s3.id },
        attrs: {'.connection': linkAttrs }
    }),
    new uml.Transition({
        source: { id: states.s3.id },
        target: { id: states.se.id },
        attrs: {'.connection': linkAttrs }
    })
];

graph.addCells(transitons);
