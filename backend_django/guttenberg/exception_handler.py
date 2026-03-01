"""
Custom exception handler following the Guttenberg error standard from FDD §5.1.

Error codes follow the pattern GUT-XXXX:
  4xxx = client errors (author action required)
  5xxx = system errors (platform team alerted)
  6xxx = external channel errors
"""
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


ERROR_CODE_MAP = {
    400: 'GUT-4000',
    401: 'GUT-4001',
    403: 'GUT-4003',
    404: 'GUT-4004',
    413: 'GUT-4013',
    422: 'GUT-4022',
    429: 'GUT-4029',
    500: 'GUT-5000',
    502: 'GUT-6002',
    503: 'GUT-6003',
}


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        error_code = ERROR_CODE_MAP.get(response.status_code, f'GUT-{response.status_code}')

        detail = response.data.get('detail', str(response.data)) if isinstance(response.data, dict) else str(response.data)

        response.data = {
            'error': {
                'code': error_code,
                'message': detail,
                'status': response.status_code,
            }
        }

    return response


class GuttenbergAPIError(Exception):
    """Base exception for Guttenberg API errors."""

    def __init__(self, code, message, detail=None, resolution=None, status_code=400):
        self.code = code
        self.message = message
        self.detail = detail
        self.resolution = resolution
        self.status_code = status_code
        super().__init__(message)

    def to_response(self):
        data = {
            'error': {
                'code': self.code,
                'message': self.message,
            }
        }
        if self.detail:
            data['error']['detail'] = self.detail
        if self.resolution:
            data['error']['resolution'] = self.resolution
        return Response(data, status=self.status_code)
