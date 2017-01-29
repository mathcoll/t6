<h2>Introduction</h2>
<p>
	t6 is using either Http or Https protocols to manage your Objects, Flows and Data Points.
</p>
<p>
	Endpoints allows to manage your own Objects, Flows, Users, and Data Points using normalized verbs:
</p>
<ul>
<li><strong>GET</strong> verb is used to retrieve information from t6 datastore;</li>
<li><strong>POST</strong> verb is used to create a new element;</li>
<li><strong>PUT</strong> verb is used to edit an existing elements;</li>
<li><strong>DELETE</strong> verb is used to delete existing elements.</li>
</ul>
<p>
	All API enpoints support json and optional Http Headers can be provided:<br />
	<span class="label label-primary">Content-Type: application/json</span><br />
	<span class="label label-primary">Accept: application/json</span><br />
</p>

<h2>Authentication</h2>
<p>
	Most API endpoint require an Authentication to identify and approve the user request. This is done by adding 
	<span class="label label-primary">Authorization: Bearer Key</span> Header to the Http request.<br />
	API Keys are expiring "tokens", default key duration is 1 hour and you can choose 7 days or 1 month. Additionally, the web-browser interface allows to extend keys duration.
</p>

<h2>Quota</h2>
<p>
	Quota is defined during the registration process. When the limit is reached, an Http error message is sent by the API and the request is not processed:
	<span class="label label-primary">429 Too Many Requests</span>.
</p>

<h2>t6 Architechture</h2>
<p>
	<img src="https://raw.githubusercontent.com/mathcoll/t6/master/docs/t6-General-structure.png" class="img-responsive center-block" alt="General-structure"/>
</p>