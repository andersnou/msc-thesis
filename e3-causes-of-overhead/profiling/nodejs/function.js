const Mustache = require('mustache');
const fs = require('fs');
const path = require('path');

const { BasicTracerProvider } = require('@opentelemetry/sdk-trace-base');
const { Resource } = require('@opentelemetry/resources');
const { SEMRESATTRS_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');
const { SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const opentelemetry = require('@opentelemetry/api');

const tracerProvider = new BasicTracerProvider({
  resource: new Resource({
    [SEMRESATTRS_SERVICE_NAME]: '610.dynamic-html-opentelemetry-nodejs',
  }),
});

const traceExporter = new OTLPTraceExporter({
  url: 'http://<REPLACE_ME>:4317',
});

tracerProvider.addSpanProcessor(new SimpleSpanProcessor(traceExporter));
tracerProvider.register();

const tracer = tracerProvider.getTracer('nodejs-tracer');

function random(b, e) {
	return Math.round(Math.random() * (e - b) + b);
}

exports.handler = async function(event) {
  const span = tracer.startSpan('handler');

  var random_numbers = new Array(event.random_len);
  for(var i = 0; i < event.random_len; ++i) {
    random_numbers[i] = random(0, 100);
  }

  let cur_time = new Date().toLocaleString()
  var input = {
    cur_time: cur_time,
    username: event.username,
    random_numbers: random_numbers
  };

  span.setAttribute('username', event.username)
  span.setAttribute('random_len', random_numbers)

  var file = path.resolve(__dirname, 'templates', 'template.html');
  span.setAttribute('template_path', file);

  return new Promise((resolve, reject) => {
    fs.readFile(file, "utf-8", function(err, data) {
      if (err) {
        span.recordException(err);
        span.end();
        reject(err);
      } else {
        const rendered = Mustache.render(data, input);
        span.setAttribute('rendered_length', rendered.length);
        span.setAttribute("render_time", cur_time)
        span.end();
        resolve(rendered);
      }
    });
  });
};
