<?php
// update.php - Update enhanced text in analysis results

// Database credentials (replace with your actual values)
$host = 'localhost';
$dbname = 'u969084943_ai_takeOff';
$username = 'u969084943_admin';
$password = 'Construction2020?';

try {
    // Create PDO connection
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get data from POST request
    $id = $_POST['id'] ?? '';
    $enhancedText = $_POST['enhanced_text'] ?? '';
    
    // Validate required fields
    if (empty($id)) {
        throw new Exception('ID is required');
    }
    
    // Prepare SQL statement to update enhanced text
    $sql = "UPDATE analysis_results SET enhanced_text = :enhanced_text, updated_at = CURRENT_TIMESTAMP WHERE id = :id";
    
    $stmt = $pdo->prepare($sql);
    
    // Bind parameters
    $stmt->bindParam(':id', $id);
    $stmt->bindParam(':enhanced_text', $enhancedText);
    
    // Execute the statement
    $stmt->execute();
    
    // Check if any rows were affected
    if ($stmt->rowCount() > 0) {
        // Return success response
        header('Content-Type: application/json');
        echo json_encode([
            'success' => true,
            'message' => 'Enhanced text updated successfully',
            'id' => $id
        ]);
    } else {
        // No rows were updated
        header('Content-Type: application/json');
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'Analysis result not found'
        ]);
    }
    
} catch (PDOException $e) {
    // Database error
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Database error: ' . $e->getMessage()
    ]);
} catch (Exception $e) {
    // General error
    header('Content-Type: application/json');
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>
