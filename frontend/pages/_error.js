function Error({ statusCode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {statusCode ? `${statusCode} Error` : 'Client Error'}
        </h1>
        <p className="text-gray-600 mb-8">
          {statusCode === 404
            ? 'This page could not be found.'
            : 'An error occurred on client'}
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
        >
          Go Home
        </button>
      </div>
    </div>
  )
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error