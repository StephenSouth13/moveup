import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface Course {
  id: string
  title: string
  description: string
  image: string
  instructor: string
}

const PRIMARY_COLOR = '#2563eb'

// Mock courses data - replace with your WordPress API call
function getCourses(): Course[] {
  return [
    {
      id: '1',
      title: 'Quản lý chiến lược kinh doanh',
      description: 'Phát triển kỹ năng quản lý chiến lược cấp cao',
      image: '/course-1.jpg',
      instructor: 'Dr. Nguyễn Văn A',
    },
    {
      id: '2',
      title: 'Lãnh đạo hiệu quả & Tư duy chiến lược',
      description: 'Trở thành lãnh đạo xuất sắc với tư duy toàn cầu',
      image: '/course-2.jpg',
      instructor: 'Ths. Trần Thị B',
    },
    {
      id: '3',
      title: 'Phát triển nhân sự & Xây dựng đội ngũ',
      description: 'Kỹ năng quản lý nhân sự hiệu quả',
      image: '/course-3.jpg',
      instructor: 'Ths. Lê Văn C',
    },
    {
      id: '4',
      title: 'Giao tiếp thuyết phục & Thương lượng',
      description: 'Thành thạo kỹ năng giao tiếp cấp cao',
      image: '/course-4.jpg',
      instructor: 'Dr. Phạm Văn D',
    },
    {
      id: '5',
      title: 'Quản lý dự án & Tối ưu hoá quy trình',
      description: 'Triển khai dự án với hiệu quả tối đa',
      image: '/course-5.jpg',
      instructor: 'Ths. Đặng Văn E',
    },
    {
      id: '6',
      title: 'Định hướng sự nghiệp & Phát triển bản thân',
      description: 'Xây dựng con đường sự nghiệp bền vững',
      image: '/course-6.jpg',
      instructor: 'Ths. Vũ Văn F',
    },
  ]
}

export default function Home() {
  const courses = getCourses()

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="flex-1 py-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light tracking-tight text-slate-900 mb-6">
            Nâng cao kỹ năng
            <br />
            <span className="text-blue-600">Lãnh đạo và Quản lý</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-500 mb-12 max-w-3xl mx-auto leading-relaxed">
            Nền tảng đào tạo nhân sự cao cấp cho các lãnh đạo tìm kiếm sự phát triển toàn diện và bền vững
          </p>

          <button
            className="inline-block px-8 py-4 text-white font-medium text-base rounded-md hover:opacity-90 transition-opacity duration-200"
            style={{ backgroundColor: PRIMARY_COLOR }}
          >
            Bắt đầu ngay
          </button>
        </div>
      </section>

      {/* Course Grid Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-light tracking-tight text-slate-900 mb-6">
              Khóa học tiêu biểu
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Các chương trình đào tạo được thiết kế bởi các chuyên gia tư vấn quốc tế
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-light tracking-tight text-slate-900 mb-8">
            Sẵn sàng để phát triển?
          </h2>
          <p className="text-lg text-slate-500 mb-12">
            Liên hệ với chúng tôi để tìm hiểu thêm về các chương trình đào tạo phù hợp với nhu cầu của bạn
          </p>
          <button
            className="inline-block px-8 py-4 text-white font-medium text-base rounded-md hover:opacity-90 transition-opacity duration-200"
            style={{ backgroundColor: PRIMARY_COLOR }}
          >
            Liên hệ ngay
          </button>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function CourseCard({ course }: { course: Course }) {
  return (
    <div className="group bg-white rounded-md overflow-hidden border border-slate-100 hover:border-slate-200 transition-all duration-300">
      {/* Image Container */}
      <div className="relative overflow-hidden bg-slate-100 aspect-square">
        <Image
          src={course.image}
          alt={course.title}
          fill
          className="object-cover w-full h-full transition-all duration-500 group-hover:saturate-100 group-hover:scale-105 saturate-0"
        />
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-light text-slate-900 mb-3 line-clamp-2">{course.title}</h3>
        <p className="text-sm text-slate-500 mb-4">{course.description}</p>
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-500">{course.instructor}</span>
          <div
            className="w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ backgroundColor: PRIMARY_COLOR }}
          />
        </div>
      </div>
    </div>
  )
}
