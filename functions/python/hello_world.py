"""
Sample AWS Lambda-style Python function

This function takes an input with a name and returns a greeting
"""
import json
import datetime

def handler(event, context):
    """
    Lambda handler function
    
    Args:
        event: Input event from the caller
        context: Execution context
    
    Returns:
        dict: Response object with greeting
    """
    print("Function execution started")
    print(f"Input event: {json.dumps(event)}")
    
    try:
        name = event.get('name', 'World')
        response = {
            'statusCode': 200,
            'body': {
                'message': f"Hello, {name}!",
                'timestamp': datetime.datetime.now().isoformat()
            }
        }
        
        print("Function execution completed successfully")
        return response
    except Exception as e:
        print(f"Function execution failed: {str(e)}")
        
        error_response = {
            'statusCode': 500,
            'body': {
                'message': 'Error processing request',
                'error': str(e)
            }
        }
        
        raise Exception(str(e))