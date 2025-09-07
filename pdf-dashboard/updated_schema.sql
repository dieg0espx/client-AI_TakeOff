-- Updated analysis results table with company and jobsite fields
CREATE TABLE analysis_results (
    -- Primary identification
    id VARCHAR(255) PRIMARY KEY,
    
    -- File information
    file_name VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    
    -- Company and Jobsite information
    company VARCHAR(255),
    jobsite VARCHAR(255),
    
    -- Final detection counts
    blue_x_shapes INTEGER DEFAULT 0,
    red_squares INTEGER DEFAULT 0,
    pink_shapes INTEGER DEFAULT 0,
    green_rectangles INTEGER DEFAULT 0,
    
    -- All result images (from CloudinaryUrls)
    step4_results_url TEXT,
    step5_results_url TEXT,
    step6_results_url TEXT,
    step7_results_url TEXT,
    step8_results_url TEXT,
    
    -- Final text content
    extracted_text LONGTEXT,
    enhanced_text LONGTEXT,
    
    -- Metadata
    status VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for better performance
    INDEX idx_file_name (file_name),
    INDEX idx_status (status),
    INDEX idx_company (company),
    INDEX idx_jobsite (jobsite),
    INDEX idx_created_at (created_at),
    INDEX idx_total_detections (blue_x_shapes, red_squares, pink_shapes, green_rectangles)
);

-- If you already have the table, use this ALTER statement to add the new fields:
-- ALTER TABLE analysis_results 
-- ADD COLUMN company VARCHAR(255) AFTER file_size,
-- ADD COLUMN jobsite VARCHAR(255) AFTER company;
