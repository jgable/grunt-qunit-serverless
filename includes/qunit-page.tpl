<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title><%= title %></title>
  <style>
  <%= style %>
  </style>
  <script>
  <%= script.header %>
  </script>
</head>
<body>
  <div id="qunit"></div>
  <div id="qunit-fixture"></div>
  <!-- Libs -->
  <script>
  <%= script.includes %>
  </script>
  <!-- QUnit -->
  <script>
  <%= script.qunit %>
  </script>
  <!-- QUnit Bridge -->
  <script>
  <%= script.qunitBridge %>
  </script>
  <!-- Tests -->
  <script>
  <%= script.tests %>
  </script>
  <!-- Templates -->
  <% _.each(script.templates, function(template) { %> <%= template %> <% }); %>
</body>
</html>