"use strict";
var t6queue = module.exports = {};
var jobs;

t6queue.export = function() {
	t6console.log(JSON.stringify());
};

t6queue.getLength = function() {
	jobs = dbJobs.getCollection("jobs");
	return jobs.chain().find().limit(10).data().length;
};

t6queue.add = function(job) {
	jobs = dbJobs.getCollection("jobs");
	let newJob = {
		"job_id": uuid.v4(),
		"taskType": job.taskType,
		"flow_id": job.flow_id,
		"execTime": ((parseInt(job.time, 10)/1000)+parseInt(typeof job.ttl!=="undefined"?job.ttl:3600, 10))*1000,
		"track_id": job.track_id, 
		"user_id": job.user_id
	}
	jobs.insert(newJob);
};

t6queue.start = function(limit) {
	jobs = dbJobs.getCollection("jobs");
	var query = {
		"$and": [
			{ "taskType" : "fuse" },
			{ "execTime": { "$lte": moment() } },
		]
	};
	var jobsToExec = jobs.chain().find(query).limit(limit).data();
	if ( jobsToExec ) {
		jobsToExec.map(function(j) {
			t6console.log(`Executing Job ${j.job_id}`, moment(j.execTime).format(logDateFormat));
			t6console.log(JSON.stringify(j));
			jobs.remove(j);
			dbJobs.saveDatabase();
		});
	}
};

t6queue.next = function() {
	t6console.log("t6queue contains "+queue.getLength()+" job/s");
	if(task.job.taskType === "fuse" && task.job.time+task.job.ttl>Date.now()) {
		t6console.log("next task", task.job.time, task.job.ttl, ">", Date.now());
		t6console.log("Processing task", JSON.stringify(task));
		setTimeout(function() {
			t6console.log("Processed fusion task", task.id);
		}, 10000);
	} else {
		t6console.log(`next task ${task.id} will be run later at ${moment(task.job.time+task.job.ttl).format(logDateFormat)}`);
	}
};

module.exports = t6queue;