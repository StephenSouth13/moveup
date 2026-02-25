import Image from 'next/image'
import Link from 'next/link'

interface Course {
  id: string
  title: string
  description: string
  image: string
  instructor: string
  level: string
  price: number
  duration: number
}

// Mock courses data - replace with database query
const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Quản lý chiến lược kinh doanh',
    description: 'Phát triển kỹ năng quản lý chiến lược cấp cao',
    image: '/course-1.jpg',
    instructor: 'Dr. Nguyễn Văn A',
    level: 'Nâng cao',
    price: 4990000,
    duration: 40,
  },
  {
    id: '2',
    title: 'Lãnh đạo hiệu quả & Tư duy chiến lược',
    description: 'Trở thành lãnh đạo xuất sắc với tư duy toàn cầu',
    image: '/course-2.jpg',
    instructor: 'Ths. Trần Thị B',
    level: 'Trung cấp',
    price: 3990000,
    duration: 35,
  },
  {
    id: '3',
    title: 'Phát triển nhân sự & Xây dựng đội ngũ',
    description: 'Kỹ năng quản lý nhân sự hiệu quả',
    image: '/course-3.jpg',
    instructor: 'Ths. Lê Văn C',
    level: 'Trung cấp',
    price: 3490000,
    duration: 32,
  },
  {
    id: '4',
    title: 'Giao tiếp thuyết phục & Thương lượng',
    description: 'Thành thạo kỹ năng giao tiếp cấp cao',
    image: '/course-4.jpg',
    instructor: 'Dr. Phạm Văn D',
    level: 'Cơ bản',
    price: 2990000,
    duration: 28,
  },
  {
    id: '5',
    title: 'Quản lý dự án & Tối ưu hoá quy trình',
    description: 'Triển khai dự án với hiệu quả tối đa',
    image: '/course-5.jpg',
    instructor: 'Ths. Đặng Văn E',
    level: 'Trung cấp',
    price: 3290000,
    duration: 30,
  },
  {
    id: '6',
    title: 'Định hướng sự nghiệp & Phát triển bản thân',
    description: 'Xây dựng con đường sự nghiệp bền vững',
    image: '/course-6.jpg',
    instructor: 'Ths. Vũ Văn F',
    level: 'Cơ bản',
    price: 2490000,
    duration: 24,
  },
]

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/">
            <span className="text-xl font-light text-slate-900">MoveUp</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/courses" className="text-sm text-slate-900 font-medium">
              Khóa học
            </Link>
            <Link href="/dashboard" className="text-sm text-slate-600 hover:text-slate-900">
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Page Title */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-slate-900 mb-4">
            Khóa học chuyên sâu
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Lựa chọn từ các chương trình đào tạo được thiết kế bởi các chuyên gia tư vấn quốc tế
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-slate-200 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="text-sm text-slate-600">
            Hiển thị <span className="font-medium text-slate-900">{mockCourses.length}</span> khóa học
          </div>
          <div className="flex gap-3">
            <input
              type="search"
              placeholder="Tìm kiếm khóa học..."
              className="px-4 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <select className="px-4 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-600">
              <option>Tất cả cấp độ</option>
              <option>Cơ bản</option>
              <option>Trung cấp</option>
              <option>Nâng cao</option>
            </select>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockCourses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <div className="group bg-white rounded-lg border border-slate-100 hover:border-slate-300 overflow-hidden transition-all hover:shadow-lg">
                  {/* Image */}
                  <div className="relative overflow-hidden bg-slate-100 aspect-video">
                    <Image
                      src={course.image}
                      alt={course.title}
                      fill
                      className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105 saturate-0"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-700 rounded">
                        {course.level}
                      </span>
                      <span className="text-xs text-slate-500">{course.duration}h</span>
                    </div>

                    <h3 className="text-lg font-light text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>

                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{course.description}</p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div>
                        <p className="text-xl font-light text-slate-900">
                          {(course.price / 1000000).toFixed(1)}M
                        </p>
                        <p className="text-xs text-slate-500">Giảng viên: {course.instructor}</p>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
