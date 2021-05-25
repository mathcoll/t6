"use strict";
var t6queue = module.exports = {};
var queue = new Queue(persistentQueue.db, 1);

queue.on("open",() => {
	t6console.log("Opening SQLite DB for t6queue");
	t6console.log("t6queue contains "+queue.getLength()+" job/s");
});

queue.on("add",task => {
	t6console.log("Added task to t6queue: "+JSON.stringify(task));
	t6console.log("t6queue contains "+queue.getLength()+" job/s");
});

queue.on("start",() => {
	t6console.log("t6queue Start");
});

queue.on("next",task => {
	t6console.log("t6queue contains "+queue.getLength()+" job/s");
	//t6console.log("task", task);
	if(task.job.taskType === "fuse") {
		t6console.log("Processing task", JSON.stringify(task));
		setTimeout(function() {
			t6console.log("Processed fusion task", task.id);
		}, 10000);
		// Must tell Queue that we have finished this task
		// This call will schedule the next task (if there is one)
		queue.done();
	}
});

// Stop the queue when it gets empty
queue.on("empty",() => {
	t6console.log("t6queue contains "+queue.getLength()+" job/");
	queue.stop();
	/*
	queue.close()
	.then(() => {
		t6console.log("t6queue closed with "+queue.getLength()+" job/");
	})
	*/
});

queue.on("stop",() => {
	t6console.log("Stopping t6queue");
});

queue.on("close",() => {
	t6console.log("Closing SQLite DB for t6queue");
});

t6queue.export = function() {
	t6console.dir(JSON.stringify());
};

t6queue.add = function(task) {
	queue.add(task);
};

t6queue.start = function() {
	queue.start();
};

t6queue.open = function() {
	queue.open()
	.then(() => {
		t6console.log("t6queue opened with "+queue.getLength()+" job/");
	})
	.catch(err => {
		t6console.log("Error occurred (t6queue):");
		t6console.log(err);
	});
};

module.exports = t6queue;