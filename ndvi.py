import ee
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

# Initialize the Earth Engine API
ee.Authenticate()
ee.Initialize()