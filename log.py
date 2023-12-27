import boto3
import json
def get_log_group_with_tag(tag_key, tag_value):
    client = boto3.client('resourcegroupstaggingapi')
    response = client.get_resources(
        TagFilters=[{
            'Key': tag_key,
            'Values': [tag_value]
        }],
        ResourceTypeFilters=['logs:log-group']
    )
    log_group_arns = [resource['ResourceARN'] for resource in response['ResourceTagMappingList']]
    log_group_names = [arn.split(':log-group:')[1] for arn in log_group_arns]

   

    return log_group_names
   

if __name__ == '__main__':
    tag_key = 'dev'
    tag_value = 'true'
    log_groups = get_log_group_with_tag(tag_key, tag_value)
    with open('log_groups.json', 'w') as f:
        json.dump(log_groups, f)
 
