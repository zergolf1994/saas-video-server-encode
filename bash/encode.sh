if [[ ! ${1} ]]; then
    echo "No fileId"
    exit 1
fi

localhost="127.0.0.1"
data=$(curl -sLf "http://${localhost}/encode/data?fileId=${1}" | jq -r ".")
error=$(echo $data | jq -r ".error")

if [[ $error == true ]]; then
    msg=$(echo $data | jq -r ".msg")
    echo "${msg}"
    exit 1
fi


task=$(echo $data | jq -r ".task")

if [[ $task != "download" ]]; then
    echo "Task: ${task}"
    exit 1
fi

encodeId=$(echo $data | jq -r ".encodeId")
curl -s "http://${localhost}/encode/update/${encodeId}?task=encode&percent=0" > /dev/null

data_encode=$(curl -sLf "http://${localhost}/convert/video?fileId=${1}" | jq -r ".")
error_encode=$(echo $data_encode | jq -r ".error")

if [[ $error_encode == true ]]; then
    msg_encode=$(echo $error_encode | jq -r ".msg")
    echo "${msg_encode}"
    exit 1
fi
echo "Converted"

sleep 1
#ส่งต่อไปยังรีโหมท
curl -s "http://${localhost}/remote/video" > /dev/null

exit 1