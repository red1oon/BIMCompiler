#!/bin/bash
# usage: probe.sh <base> <path> <serviceType> <table> <recordId> <filter>   - one ModelCRUDRequest with the pilot login (GardenAdmin), prints the raw response
B=${1:-http://localhost:8088}; P=${2:-query_data}; S=$3; T=$4; R=${5:-0}; F=$6
F_XML=""; [ -n "$F" ] && F_XML="<Filter>$F</Filter>"
curl -s -m 20 -X POST "$B/ADInterface/services/rest/model_adservice/$P" -H 'Content-Type: application/xml' -H 'Accept: application/xml' -d "<?xml version=\"1.0\" encoding=\"UTF-8\"?><ModelCRUDRequest xmlns=\"http://idempiere.org/ADInterface/1_0\"><ModelCRUD><serviceType>$S</serviceType><TableName>$T</TableName><RecordID>$R</RecordID>$F_XML<Action>Read</Action></ModelCRUD><ADLoginRequest><user>GardenAdmin</user><pass>GardenAdmin</pass><lang>en_US</lang><ClientID>11</ClientID><RoleID>102</RoleID><OrgID>11</OrgID><WarehouseID>103</WarehouseID><stage>0</stage></ADLoginRequest></ModelCRUDRequest>"
