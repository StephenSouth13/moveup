-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  bio TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  instructor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT,
  level TEXT DEFAULT 'beginner' CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  price DECIMAL(10, 2) DEFAULT 0,
  image_url TEXT,
  thumbnail_url TEXT,
  duration_hours INTEGER,
  total_lessons INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courses
CREATE POLICY "courses_select_published" ON public.courses FOR SELECT USING (is_published = TRUE);
CREATE POLICY "courses_select_own" ON public.courses FOR SELECT USING (instructor_id = auth.uid());
CREATE POLICY "courses_insert_own" ON public.courses FOR INSERT WITH CHECK (
  instructor_id = auth.uid() AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('instructor', 'admin')
);
CREATE POLICY "courses_update_own" ON public.courses FOR UPDATE USING (
  instructor_id = auth.uid() AND (SELECT role FROM profiles WHERE id = auth.uid()) IN ('instructor', 'admin')
);
CREATE POLICY "courses_admin_all" ON public.courses FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  "order" INTEGER NOT NULL,
  video_url TEXT,
  transcript TEXT,
  resources TEXT,
  duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lessons
CREATE POLICY "lessons_select_published" ON public.lessons FOR SELECT USING (
  course_id IN (SELECT id FROM courses WHERE is_published = TRUE)
);
CREATE POLICY "lessons_select_own" ON public.lessons FOR SELECT USING (
  course_id IN (SELECT id FROM courses WHERE instructor_id = auth.uid())
);
CREATE POLICY "lessons_instructor_all" ON public.lessons FOR ALL USING (
  course_id IN (SELECT id FROM courses WHERE instructor_id = auth.uid())
);
CREATE POLICY "lessons_admin_all" ON public.lessons FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Create enrollments table
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  progress_percent INTEGER DEFAULT 0,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for enrollments
CREATE POLICY "enrollments_select_own" ON public.enrollments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "enrollments_insert_own" ON public.enrollments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "enrollments_update_own" ON public.enrollments FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "enrollments_instructor_view" ON public.enrollments FOR SELECT USING (
  course_id IN (SELECT id FROM courses WHERE instructor_id = auth.uid())
);
CREATE POLICY "enrollments_admin_all" ON public.enrollments FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Create lesson_progress table
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT FALSE,
  time_spent_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(enrollment_id, lesson_id)
);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for lesson_progress
CREATE POLICY "lesson_progress_select_own" ON public.lesson_progress FOR SELECT USING (
  enrollment_id IN (SELECT id FROM enrollments WHERE user_id = auth.uid())
);
CREATE POLICY "lesson_progress_insert_own" ON public.lesson_progress FOR INSERT WITH CHECK (
  enrollment_id IN (SELECT id FROM enrollments WHERE user_id = auth.uid())
);
CREATE POLICY "lesson_progress_update_own" ON public.lesson_progress FOR UPDATE USING (
  enrollment_id IN (SELECT id FROM enrollments WHERE user_id = auth.uid())
);
CREATE POLICY "lesson_progress_admin_all" ON public.lesson_progress FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cart_items
CREATE POLICY "cart_items_select_own" ON public.cart_items FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "cart_items_insert_own" ON public.cart_items FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "cart_items_update_own" ON public.cart_items FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "cart_items_delete_own" ON public.cart_items FOR DELETE USING (user_id = auth.uid());

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  payment_method TEXT,
  stripe_payment_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for orders
CREATE POLICY "orders_select_own" ON public.orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "orders_insert_own" ON public.orders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "orders_admin_all" ON public.orders FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id),
  price_at_purchase DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for order_items
CREATE POLICY "order_items_select_own" ON public.order_items FOR SELECT USING (
  order_id IN (SELECT id FROM orders WHERE user_id = auth.uid())
);
CREATE POLICY "order_items_admin_all" ON public.order_items FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Create certificates table
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL UNIQUE REFERENCES public.enrollments(id) ON DELETE CASCADE,
  certificate_url TEXT,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for certificates
CREATE POLICY "certificates_select_own" ON public.certificates FOR SELECT USING (
  enrollment_id IN (SELECT id FROM enrollments WHERE user_id = auth.uid())
);
CREATE POLICY "certificates_insert_own" ON public.certificates FOR INSERT WITH CHECK (
  enrollment_id IN (SELECT id FROM enrollments WHERE user_id = auth.uid())
);
CREATE POLICY "certificates_admin_all" ON public.certificates FOR ALL USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_courses_instructor_id ON public.courses(instructor_id);
CREATE INDEX IF NOT EXISTS idx_courses_is_published ON public.courses(is_published);
CREATE INDEX IF NOT EXISTS idx_courses_category ON public.courses(category);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON public.enrollments(status);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_enrollment_id ON public.lesson_progress(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON public.lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(new.raw_user_meta_data ->> 'last_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
