# -*- coding: utf8 -*-

import json, datetime

with open("a1_accident_data.json", "r") as f:
	data = json.load(f)
	print data

	newData = {"results":[]}

	accidents = data["results"]

	for accident in accidents:
		# print accident["casualty"]

		b = accident["casualty"]
		death = b[b.find("亡".decode("utf-8")) + 1: b.find(";")]
		hurt = b[b.find("傷".decode("utf-8")) + 1:]
		accident["casualty"] = death + "," + hurt

		# print accident["time"]
		# print accident["casualty"]

		# print accident["time"]
		print accident["time"][4:]
		dateString = accident["time"][4:9]
		print dateString.replace("月".decode("utf-8"), "/")
		timeString = accident["time"][10:]
		timeString = timeString.replace("分".decode("utf-8"), "")
		print timeString.replace("時".decode("utf-8"), ":")
		accident["time"] = timeString.replace("時".decode("utf-8"), ":")
		accident["date"] = dateString.replace("月".decode("utf-8"), "/")
		newData["results"].append(accident)

		if "working" in accident:
			del accident["working"]
		if "updatedAt" in accident:
			del accident["updatedAt"]
		if "createdAt" in accident:
			del accident["createdAt"]
		if "skip" in accident:
			del accident["skip"]
		if "saved_time" in accident:
			del accident["saved_time"]
		if "objectId" in accident:
			del accident["objectId"]

	print json.dumps(newData, indent=4)
	with open("a1_accident_data_2015_05_26.json", "w") as of:
		json.dump(newData, of) 

