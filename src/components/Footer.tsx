import { HiBookOpen as BookOpen } from 'react-icons/hi'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-6 md:mb-0">
            <BookOpen className="w-8 h-8 text-primary mr-2" />
            <span className="text-xl font-bold text-white">Leapbod</span>
          </div>
          <div className="text-sm">
            © {new Date().getFullYear()} Leapbod. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer 