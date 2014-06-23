#!/usr/bin/python
import sys
import os
import json
from collections import OrderedDict

if __name__ == "__main__":
	if 4 != len(sys.argv):
		print("usage: %s path_to_browse url_prefix outputFile" % sys.argv[0])
		sys.exit(1)
	path = sys.argv[1]

	if not os.path.isdir(path):
		print("Path: %s does not exist", path)
		sys.exit(2)
	if path[-1] != "/":
		path = path + "/"
	result_dict = OrderedDict()
	for root, dirs, files in os.walk(path):
		fakePath = root[len(path):]
		currentDictSplitted = fakePath.split("/")
		workOn = result_dict
		for key in currentDictSplitted:
			if 0 != len(key):
				workOn = workOn[key]["subFolder"]
		for d in dirs:
			workOn[d] = {
				"isDir": True,
				"name": d,
				"subFolder": OrderedDict()
			}
		for f in files:
			workOn[f] = {
				"isDir": False,
				"name": f,
				"url": os.path.join(sys.argv[2], fakePath, f)
			}
	with open(sys.argv[3], "w") as f:
		json.dump(result_dict, f, indent=2)
