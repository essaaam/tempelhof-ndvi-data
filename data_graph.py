import json
import matplotlib.pyplot as plt

# Load JSON data from a file
with open('area3_ndvi_data.json', 'r') as f:
    data = json.load(f)

# Extract the x and y values from the JSON data
x_values = []
y_values = []

for feature in data['features']:
    properties = feature['properties']
    if properties['NDVI'] is not None:
        x_values.append(f"{int(properties['month'])}-{int(properties['year'])}")
        y_values.append(properties['NDVI'])

# Create the plot
plt.figure(figsize=(10, 5))
plt.plot(x_values, y_values, marker='o', linestyle='-', color='b')

# Customize the plot
plt.xticks(rotation=90)
plt.xlabel('Month-Year')
plt.ylabel('NDVI')
plt.title('NDVI Data')
plt.grid(True)

# Display the plot
plt.tight_layout()
plt.show()
