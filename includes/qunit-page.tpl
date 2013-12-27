<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title><%= title %></title>
  <%= style %>
  <script>
  <%= script.header %>
  </script>
  <!-- Libs -->
  <% _.each(script.includes, function(include) { %> <%= include.tag %> <% }); %>
  <!-- QUnit -->
  <%= script.qunit %>
  <!-- QUnit Bridge -->
  <%= script.qunitBridge %>
  <!-- Tests -->
  <% _.each(script.tests, function(test) { %> <%= test.tag %> <% }); %>
</head>
<body>
  <div id="qunit"></div>
  <div id="qunit-fixture"></div>
  <!-- Templates -->
  <% _.each(script.templates, function(template) { %> <%= template.tag %> <% }); %>
</body>
</html>